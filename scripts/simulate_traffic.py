#!/usr/bin/env python3
"""
Simulates realistic visitor traffic against the ABC Tutoring PostHog project,
so the dashboard has data to show Dana without waiting on real visitors.

Models a browse -> filter -> view tutor -> start booking -> complete booking
funnel, spread over the last 14 days, with subject interest weighted so the
dashboard shows a clear demand signal (Math and Science outpace the rest) --
this is the evidence Dana asked for to decide which two subjects to hire for.

Usage:
    python3 scripts/simulate_traffic.py

Requires only the Python standard library.
"""

import json
import random
import time
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone

API_KEY = "phc_oiDPjbgwPtbML9VcesBPzmV7cPj47hVkfFeAovRA2VzT"
API_HOST = "https://us.i.posthog.com"
BATCH_ENDPOINT = f"{API_HOST}/batch/"
BATCH_SIZE = 200

# subject -> (weight, [tutor names])
SUBJECTS = {
    "Math": (35, ["Maria Chen"]),
    "Science": (28, ["James Okafor"]),
    "English": (14, ["Liam Patel"]),
    "Spanish": (13, ["Sofia Ramirez"]),
    "Coding": (10, ["Ava Thompson"]),
}

# tutor -> (min grade, max grade), 0 = Kindergarten. Mirrors js/data.js.
TUTOR_GRADE_RANGE = {
    "Maria Chen": (0, 12),
    "James Okafor": (0, 12),
    "Liam Patel": (0, 12),
    "Sofia Ramirez": (0, 12),
    "Ava Thompson": (0, 12),
}

NUM_SESSIONS = 260
DAYS_BACK = 14


def weighted_subject():
    subjects = list(SUBJECTS.keys())
    weights = [SUBJECTS[s][0] for s in subjects]
    return random.choices(subjects, weights=weights, k=1)[0]


def random_timestamp_days_ago(max_days):
    day_offset = random.uniform(0, max_days)
    # bias slightly toward evenings (parents browsing after school/work)
    hour = min(23, max(7, int(random.gauss(18, 3))))
    minute = random.randint(0, 59)
    dt = datetime.now(timezone.utc) - timedelta(days=day_offset)
    dt = dt.replace(hour=hour, minute=minute, second=random.randint(0, 59))
    return dt


def build_session_events():
    """Return a list of (event_name, properties, timestamp) for one visitor session."""
    distinct_id = str(uuid.uuid4())
    subject = weighted_subject()
    tutor = random.choice(SUBJECTS[subject][1])
    t0 = random_timestamp_days_ago(DAYS_BACK)
    events = []

    def add(name, props=None, offset_seconds=0):
        events.append((name, {**(props or {}), "distinct_id": distinct_id}, t0 + timedelta(seconds=offset_seconds)))

    # everyone lands on the page
    add("$pageview", {"$current_url": "https://lynnkhaingupskill.github.io/"}, 0)

    # most visitors use the subject filter
    if random.random() < 0.72:
        add("subject_filter_used", {"subject": subject}, 8)

        # of those, most go on to view a tutor
        if random.random() < 0.80:
            add("tutor_viewed", {"tutor": tutor, "subject": subject}, 20)

            # of those, a smaller share start booking
            if random.random() < 0.38:
                add("booking_started", {"tutor": tutor, "subject": subject, "slot": "sample-slot"}, 45)

                # of those, most but not all complete
                if random.random() < 0.58:
                    grade_min, grade_max = TUTOR_GRADE_RANGE[tutor]
                    student_grade = random.randint(grade_min, grade_max)
                    add(
                        "booking_completed",
                        {
                            "tutor": tutor,
                            "subject": subject,
                            "slot": "sample-slot",
                            "student_grade": student_grade,
                        },
                        90,
                    )

    return events


def to_posthog_event(name, props, ts):
    return {
        "event": name,
        "properties": props,
        "timestamp": ts.isoformat(),
    }


def send_batch(events):
    payload = json.dumps({"api_key": API_KEY, "batch": events}).encode("utf-8")
    req = urllib.request.Request(
        BATCH_ENDPOINT,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.status, resp.read().decode("utf-8")


def main():
    random.seed()
    all_events = []
    for _ in range(NUM_SESSIONS):
        for name, props, ts in build_session_events():
            all_events.append(to_posthog_event(name, props, ts))

    print(f"Generated {len(all_events)} events across {NUM_SESSIONS} simulated sessions.")

    for i in range(0, len(all_events), BATCH_SIZE):
        chunk = all_events[i : i + BATCH_SIZE]
        status, body = send_batch(chunk)
        print(f"Sent batch {i // BATCH_SIZE + 1} ({len(chunk)} events) -> {status} {body}")
        time.sleep(0.3)

    print("Done. Give PostHog a minute or two to ingest before checking the dashboard.")


if __name__ == "__main__":
    main()
