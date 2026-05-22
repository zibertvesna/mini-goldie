import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDluw4PmV4U9RxMRGvkjO0bJeirTdVTElY",
  authDomain: "mini-goldie.firebaseapp.com",
  projectId: "mini-goldie",
  storageBucket: "mini-goldie.firebasestorage.app",
  messagingSenderId: "898930684722",
  appId: "mini-goldie",
};

export const app = initializeApp(firebaseConfig);