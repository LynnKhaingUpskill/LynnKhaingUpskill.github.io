// Seed data for the ABC Tutoring prototype.
// Availability mirrors how Dana actually manages it: specific slots that
// vary week to week (not a fixed recurring schedule), fixed 1-hour sessions.

const TUTORS = [
  {
    id: "maria-chen",
    name: "Maria Chen",
    photo: "https://i.pravatar.cc/200?img=47",
    subjects: ["Math"],
    gradeLevels: "Grades K-12",
    hourlyRate: 40,
    bio: "Algebra through Calculus. Patient with students who feel behind.",
    slots: [
      { id: "maria-1", label: "Mon, Sep 8 · 4:00 PM", booked: false },
      { id: "maria-2", label: "Tue, Sep 9 · 5:00 PM", booked: true },
      { id: "maria-3", label: "Wed, Sep 10 · 3:30 PM", booked: false },
      { id: "maria-4", label: "Fri, Sep 12 · 4:30 PM", booked: false }
    ]
  },
  {
    id: "james-okafor",
    name: "James Okafor",
    photo: "https://i.pravatar.cc/200?img=12",
    subjects: ["Science"],
    gradeLevels: "Grades K-12",
    hourlyRate: 45,
    bio: "Biology, Chemistry, and Physics. Focus on building intuition, not just formulas.",
    slots: [
      { id: "james-1", label: "Mon, Sep 8 · 6:00 PM", booked: false },
      { id: "james-2", label: "Thu, Sep 11 · 4:00 PM", booked: false },
      { id: "james-3", label: "Fri, Sep 12 · 5:00 PM", booked: true }
    ]
  },
  {
    id: "sofia-ramirez",
    name: "Sofia Ramirez",
    photo: "https://i.pravatar.cc/200?img=32",
    subjects: ["Spanish"],
    gradeLevels: "Grades K-12",
    hourlyRate: 35,
    bio: "Conversational and classroom Spanish for all ages.",
    slots: [
      { id: "sofia-1", label: "Tue, Sep 9 · 3:00 PM", booked: false },
      { id: "sofia-2", label: "Wed, Sep 10 · 4:00 PM", booked: false },
      { id: "sofia-3", label: "Thu, Sep 11 · 3:30 PM", booked: false }
    ]
  },
  {
    id: "liam-patel",
    name: "Liam Patel",
    photo: "https://i.pravatar.cc/200?img=51",
    subjects: ["English"],
    gradeLevels: "Grades K-12",
    hourlyRate: 35,
    bio: "Essay writing, reading comprehension, and test prep.",
    slots: [
      { id: "liam-1", label: "Mon, Sep 8 · 5:00 PM", booked: false },
      { id: "liam-2", label: "Wed, Sep 10 · 6:00 PM", booked: true },
      { id: "liam-3", label: "Fri, Sep 12 · 3:00 PM", booked: false }
    ]
  },
  {
    id: "ava-thompson",
    name: "Ava Thompson",
    photo: "https://i.pravatar.cc/200?img=25",
    subjects: ["Coding"],
    gradeLevels: "Grades K-12",
    hourlyRate: 50,
    bio: "Intro Python and web development for curious beginners.",
    slots: [
      { id: "ava-1", label: "Tue, Sep 9 · 4:00 PM", booked: false },
      { id: "ava-2", label: "Thu, Sep 11 · 5:30 PM", booked: false }
    ]
  }
];

const ALL_SUBJECTS = [...new Set(TUTORS.flatMap(t => t.subjects))].sort();
