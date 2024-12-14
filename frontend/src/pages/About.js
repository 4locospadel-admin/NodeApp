import React, { useState } from "react";
import "./About.css";

function About() {
  const [language, setLanguage] = useState("en");
  const [expandedSections, setExpandedSections] = useState({});

  
  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const content = {
    en: {
      title: "Padel",
      intro:
        "Padel is one of the fastest-growing sports, combining elements of tennis and squash. It's fun, social, and accessible for players of all levels.",
      sections: [
        {
          title: "What is Padel?",
          text: `Padel is typically played in doubles on an enclosed court about one-third the size of a tennis court. The walls are integral to the game, allowing strategic and dynamic play.`,
        },
        {
          title: "A Brief History",
          text: `Padel was invented in 1969 in Acapulco, Mexico, by Enrique Corcuera. Since then, it has gained immense popularity, especially in Spain and Argentina, and is now played worldwide.`,
        },
        {
          title: "Full Padel Rules",
          text: `Padel has straightforward rules:
          <ul>
            <li>Matches are played in doubles on a court with walls.</li>
            <li>The scoring system is the same as tennis: 15, 30, 40, game.</li>
            <li>Serves must be underarm and hit diagonally into the opposite service box.</li>
            <li>The ball must bounce before hitting a wall.</li>
            <li>Points are won if the ball bounces twice on the opponent’s court or if the opponent fails to return the ball.</li>
          </ul>`,
        },
        {
          title: "Benefits of Padel",
          text: `<strong>Padel</strong> is more than just a game. It offers:
          <ul>
            <li><strong>Social engagement:</strong> A fun way to interact and bond with others.</li>
            <li><strong>Physical fitness:</strong> Great for improving endurance, reflexes, and agility.</li>
            <li><strong>Mental challenge:</strong> Involves strategic thinking and teamwork.</li>
          </ul>`,
        },
        {
          title: "About the App",
          text: `Our app makes booking and managing padel court reservations effortless. Features include:
          <ul>
            <li><strong>Easy court reservation and management.</strong></li>
            <li><strong>Personalized profiles</strong> for tracking bookings.</li>
            <li><strong>Inquiry system</strong> for contacting support.</li>
          </ul>`,
        },
        {
          title: "Frequently Asked Questions (FAQ)",
          text: `
          <strong>Do I need prior experience to play padel?</strong><br />
          No, padel is beginner-friendly and easy to learn.<br />
          <strong>What equipment do I need?</strong><br />
          A padel racquet, padel balls, and comfortable sportswear. Most clubs provide rentals.<br />
          <strong>How do I cancel a reservation?</strong><br />
          Go to your reservations in the app and click "Cancel."`,
        },
      ],
    },
    sk: {
      title: "Padel",
      intro:
        "Padel je jedným z najrýchlejšie rastúcich športov, ktorý kombinuje prvky tenisu a squashu. Je zábavný, sociálny a dostupný pre všetky úrovne hráčov.",
      sections: [
        {
          title: "Čo je Padel?",
          text: `Padel sa zvyčajne hrá vo štvorhre na ohradenom ihrisku, ktoré je asi tretinou veľkosti tenisového kurtu. Steny sú neoddeliteľnou súčasťou hry, čo umožňuje strategickú a dynamickú hru.`,
        },
        {
          title: "Krátka história",
          text: `Padel bol vynájdený v roku 1969 v Acapulcu, Mexiko, Enrique Corcuerom. Odvtedy si získal obrovskú popularitu, najmä v Španielsku a Argentíne, a dnes sa hrá po celom svete.`,
        },
        {
          title: "Pravidlá Padelu",
          text: `Pravidlá padela sú jednoduché:
          <ul>
            <li>Zápasy sa hrajú vo štvorhre na kurte so stenami.</li>
            <li>Bodovací systém je rovnaký ako v tenise: 15, 30, 40, hra.</li>
            <li>Podanie musí byť spodné a zaslané diagonálne do súperovho servisného poľa.</li>
            <li>Loptička sa musí odraziť od zeme predtým, ako sa dotkne steny.</li>
            <li>Body sa získavajú, ak loptička dvakrát odrazí na strane súpera alebo ak súper nedokáže vrátiť loptičku.</li>
          </ul>`,
        },
        {
          title: "Výhody Padela",
          text: `<strong>Padel</strong> je viac ako len hra. Ponúka:
          <ul>
            <li><strong>Sociálnu interakciu:</strong> Skvelý spôsob, ako sa zabaviť a spojiť s ostatnými.</li>
            <li><strong>Fyzickú kondíciu:</strong> Zlepšuje výdrž, reflexy a pohyblivosť.</li>
            <li><strong>Mentálnu výzvu:</strong> Zahŕňa strategické myslenie a tímovú prácu.</li>
          </ul>`,
        },
        {
          title: "O aplikácii",
          text: `Naša aplikácia uľahčuje rezervácie a správu padelových kurtov. Funkcie zahŕňajú:
          <ul>
            <li><strong>Jednoduché rezervácie kurtov a ich správu.</strong></li>
            <li><strong>Personalizované profily</strong> na sledovanie rezervácií.</li>
            <li><strong>Systém dotazov</strong> na kontaktovanie podpory.</li>
          </ul>`,
        },
        {
          title: "Často kladené otázky (FAQ)",
          text: `
          <strong>Potrebujem skúsenosti na hranie padelu?</strong><br />
          Nie, padel je vhodný pre začiatočníkov.<br />
          <strong>Aké vybavenie potrebujem?</strong><br />
          Raketku na padel, loptičky a pohodlné športové oblečenie. Väčšina klubov ponúka prenájom.<br />
          <strong>Ako zruším rezerváciu?</strong><br />
          Prejdite na svoje rezervácie v aplikácii a kliknite na "Zrušiť."`,
        },
      ],
    },
  };
  
  const selectedContent = content[language];

  return (
    <div className="about-page">
      <div className="language-selector">
        <label htmlFor="language">Language:</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="sk">Slovensky</option>
        </select>
      </div>

      <h1>{selectedContent.title}</h1>
      <p>{selectedContent.intro}</p>

      {selectedContent.sections.map((section, index) => (
        <div key={index} className="section">
          <div className="section-header" onClick={() => toggleSection(index)}>
            <span className="section-title">{section.title}</span>
            <span className="section-arrow">{expandedSections[index] ? "▲" : "▼"}</span>
          </div>
          {expandedSections[index] && (
            <div
              className="section-content"
              dangerouslySetInnerHTML={{ __html: section.text }}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default About;