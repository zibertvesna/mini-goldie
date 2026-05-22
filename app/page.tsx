"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../lib/firestore";

const PIN = "1234";

/* INLINE CSS FIX (fixes invisible dates issue) */
const calendarFix = `
.react-calendar {
  width: 100%;
  border: none;
  font-family: Arial;
}

.react-calendar button {
  color: black;
}

.react-calendar__tile {
  padding: 10px;
}

.react-calendar__tile--active {
  background: #ff4da6 !important;
  color: white !important;
}
`;

export default function Home() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");

  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!unlocked) return;

    const unsub = onSnapshot(collection(db, "appointments"), (snap) => {
      setAppointments(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [unlocked]);

  const login = () => {
    if (pin === PIN) setUnlocked(true);
    else alert("Wrong PIN");
  };

  const book = async () => {
    if (!name || !selectedTime) return;

    await addDoc(collection(db, "appointments"), {
      name,
      date: date.toDateString(),
      time: selectedTime,
    });

    setName("");
    setSelectedTime("");
  };

  const times = [
    "06:00","06:30",
    "07:00","07:30",
    "08:00","08:30",
    "09:00","09:30",
    "10:00","10:30",
    "11:00","11:30",
    "12:00","12:30",
    "13:00","13:30",
    "14:00","14:30",
    "15:00","15:30",
    "16:00","16:30",
    "17:00","17:30",
    "18:00","18:30",
    "19:00","19:30",
    "20:00","20:30",
    "21:00","21:30",
    "22:00"
  ];

  if (!unlocked) {
    return (
      <main style={styles.screen}>
        <div style={styles.card}>
          <h2>💅 Goldie</h2>

          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={styles.input}
          />

          <button onClick={login} style={styles.button}>
            Odkleni
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.screen}>
      <div style={styles.app}>

        <style>{calendarFix}</style>

        <h2>📅 Celoletni koledar</h2>

        <Calendar
          onChange={(value: any) => setDate(value)}
          value={date}
          minDetail="month"
          maxDetail="year"
        />

        <input
          placeholder="Ime stranke"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <div style={styles.times}>
          {times.map((t) => {
            const isTaken = appointments.some(
              (a) =>
                a.date === date.toDateString() &&
                a.time === t
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

        <button onClick={book} style={styles.saveBtn}>
          Shrani termin
        </button>

      </div>
    </main>
  );
}

const styles: any = {
  screen: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    fontFamily: "Arial",
    background: "#fff",
  },

  card: {
    marginTop: 120,
    padding: 20,
    width: 260,
    background: "#f5f5f5",
    borderRadius: 16,
    textAlign: "center",
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

  times: {
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