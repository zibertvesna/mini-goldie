"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../lib/firestore";

const PIN = "1234";

export default function Home() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [selectedDay, setSelectedDay] = useState("1");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");

  const [appointments, setAppointments] = useState<any[]>([]);

  /* FIREBASE LIVE DATA */
  useEffect(() => {
    if (!unlocked) return;

    const unsub = onSnapshot(collection(db, "appointments"), (snap) => {
      setAppointments(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [unlocked]);

  /* LOGIN */
  const login = () => {
    if (pin === PIN) setUnlocked(true);
    else alert("Wrong PIN");
  };

  /* BOOK */
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

  const times = [
    "09:00","09:30","10:00","10:30",
    "11:00","11:30","12:00","12:30",
    "13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30",
  ];

  if (!unlocked) {
    return (
      <main style={styles.screen}>
        <div style={styles.box}>
          <h2>💅 Goldie</h2>

          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={styles.input}
          />

          <button onClick={login} style={styles.button}>
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.screen}>
      <div style={styles.app}>

        <h2>📅 Booking</h2>

        {/* DAYS */}
        <div style={styles.grid}>
          {Array.from({ length: 31 }, (_, i) => {
            const d = String(i + 1);

            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                style={{
                  ...styles.day,
                  background: selectedDay === d ? "#ff4da6" : "#eee",
                  color: selectedDay === d ? "#fff" : "#000",
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* NAME */}
        <input
          placeholder="Ime"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        {/* TIMES */}
        <div style={styles.timeGrid}>
          {times.map((t) => {
            const isTaken = appointments.some(
              (a) => a.day === selectedDay && a.time === t
            );

            return (
              <button
                key={t}
                disabled={isTaken}
                onClick={() => setSelectedTime(t)}
                style={{
                  ...styles.timeBtn,
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
        <button onClick={book} style={styles.saveBtn}>
          Shrani termin
        </button>

      </div>
    </main>
  );
}

/* STYLES — SAFE VERSION (NO TYPE ERRORS) */
const styles = {
  screen: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
    background: "#fff",
  },

  box: {
    marginTop: 120,
    padding: 20,
    width: 260,
    background: "#f5f5f5",
    borderRadius: 16,
  },

  app: {
    width: 380,
    padding: 16,
  },

  input: {
    width: "100%",
    padding: 10,
    margin: "10px 0",
  },

  button: {
    width: "100%",
    padding: 12,
    background: "#ff4da6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: 6,
    marginBottom: 10,
  },

  day: {
    padding: 10,
    border: "none",
    borderRadius: 10,
  },

  timeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 6,
    marginTop: 10,
  },

  timeBtn: {
    padding: 10,
    border: "none",
    borderRadius: 10,
  },

  saveBtn: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#ff4da6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
  },
};