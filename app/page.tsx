"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../lib/firestore";

const PIN = "1234";

export default function Home() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [selectedDay, setSelectedDay] = useState("22");
  const [selectedTime, setSelectedTime] = useState("");

  const [name, setName] = useState("");

  const [appointments, setAppointments] = useState<any[]>([]);

  /* FIREBASE LIVE */
  useEffect(() => {
    if (!unlocked) return;

    const unsub = onSnapshot(collection(db, "appointments"), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [unlocked]);

  /* LOGIN */
  if (!unlocked) {
    return (
      <main style={screen}>
        <div style={box}>
          <h2>💅 Goldie</h2>

          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={input}
          />

          <button
            onClick={() => setUnlocked(pin === PIN)}
            style={btn}
          >
            Odkleni
          </button>
        </div>
      </main>
    );
  }

  /* BOOK SLOT */
  const book = async () => {
    if (!name || !selectedTime) return;

    await addDoc(collection(db, "appointments"), {
      name,
      day: selectedDay,
      time: selectedTime,
    });

    setName("");
    setSelectedTime("");
  };

  const taken = appointments;

  return (
    <main style={screen}>
      <div style={app}>

        <h2>📅 Booking</h2>

        {/* DAYS */}
        <div style={grid}>
          {Array.from({ length: 31 }, (_, i) => {
            const d = String(i + 1);

            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                style={{
                  ...day,
                  background: selectedDay === d ? "#ff4da6" : "#eee",
                  color: selectedDay === d ? "#fff" : "#000",
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* NAME INPUT */}
        <input
          placeholder="Ime stranke"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />

        {/* TIMES */}
        <div style={timeGrid}>
          {times.map(t => {
            const isTaken = taken.some(
              a => a.day === selectedDay && a.time === t
            );

            return (
              <button
                key={t}
                disabled={isTaken}
                onClick={() => setSelectedTime(t)}
                style={{
                  ...timeBtn,
                  background: isTaken
                    ? "#ccc"
                    : selectedTime === t
                    ? "#ff4da6"
                    : "#f5f5f5",
                  color: selectedTime === t ? "#fff" : "#000",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* SAVE */}
        <button onClick={book} style={saveBtn}>
          Shrani termin
        </button>

      </div>
    </main>
  );
}

/* TIMES */
const times = [
  "09:00","09:30",
  "10:00","10:30",
  "11:00","11:30",
  "12:00","12:30",
  "13:00","13:30",
  "14:00","14:30",
  "15:00","15:30",
  "16:00","16:30",
];

/* STYLES */
const screen = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  fontFamily: "Arial",
  background: "#fff",
};

const box = {
  marginTop: 120,
  padding: 20,
  width: 260,
  background: "#f5f5f5",
  borderRadius: 16,
  textAlign: "center",
};

const app = {
  width: 380,
  padding: 16,
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  marginBottom: 10,
};

const btn = {
  width: "100%",
  padding: 12,
  background: "#ff4da6",
  color: "#fff",
  border: "none",
  borderRadius: 10,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  gap: 6,
  marginBottom: 10,
};

const day = {
  padding: 10,
  border: "none",
  borderRadius: 10,
};

const timeGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 6,
  marginTop: 10,
};

const timeBtn = {
  padding: 10,
  border: "none",
  borderRadius: 10,
};

const saveBtn = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  background: "#ff4da6",
  color: "#fff",
  border: "none",
  borderRadius: 10,
};