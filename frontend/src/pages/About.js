import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      <h1>About Padel</h1>

      <section className="section">
        <h2>What is Padel?</h2>
        <p>
          Padel is a fast-growing racquet sport that blends elements of tennis
          and squash. It’s typically played in doubles on an enclosed court
          that's about one-third the size of a tennis court. The game is
          characterized by its dynamic play, with walls being part of the game,
          allowing for strategic and exciting rallies.
        </p>
      </section>

      <section className="section">
        <h2>A Brief History</h2>
        <p>
          Padel originated in Acapulco, Mexico, in 1969 when Enrique Corcuera
          adapted his squash court to create a new game. Since then, padel has
          grown in popularity, particularly in Spain, Argentina, and other
          parts of Europe. Today, it’s one of the fastest-growing sports
          worldwide, with courts popping up globally.
        </p>
      </section>

      <section className="section">
        <h2>About Our App</h2>
        <p>
          This app is designed to make padel court reservations effortless. Here
          are some key features:
        </p>
        <ul>
          <li>
            <strong>Reservation System:</strong> Quickly book courts based on
            availability.
          </li>
          <li>
            <strong>Support Inquiries:</strong> Contact us for questions or
            feedback directly from the app.
          </li>
          <li>
            <strong>Dynamic Scheduling:</strong> View and manage reservations
            in an easy-to-navigate interface.
          </li>
        </ul>
      </section>

      <section className="section faq-section">
        <h2>Frequently Asked Questions (FAQ)</h2>
        <h3>What equipment do I need to play padel?</h3>
        <p>
          You’ll need a padel racquet, padel balls, and comfortable sports
          clothing. Most clubs provide racquets and balls for hire.
        </p>

        <h3>Can I play padel if I’ve never played tennis?</h3>
        <p>
          Absolutely! Padel is beginner-friendly and easy to pick up, even if
          you’ve never played racquet sports before.
        </p>

        <h3>How do I create a reservation in the app?</h3>
        <p>
          Navigate to the "Reservations" page, select a date and time, choose a
          court, and confirm your booking.
        </p>

        <h3>What happens if I need to cancel my reservation?</h3>
        <p>
          You can cancel your reservation directly in the app. Go to your
          reservation details and click "Cancel."
        </p>
      </section>
    </div>
  );
}

export default About;