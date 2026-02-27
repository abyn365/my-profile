export default async function handler(request, response) {
  const imageUrl = "https://i.imgur.com/UUigaWa.jpeg";

  const groupedAchievements = {
    "2025": [
      "Medali Emas Bahasa Indonesia OSSI 2025, 23 Februari 2025",
      "Medali Emas Bahasa Inggris OSSI 2025, 23 Februari 2025",
      "Medali Emas Biologi OSSI 2025, 23 Februari 2025",
      "Medali Perunggu Bahasa Inggris The 3rd OSBANAS, 9 Februari 2025"
    ],
    "2024": [
      "Medali Emas Bahasa Indonesia Pandawa 2 Competition, 17 Oktober 2024",
      "Medali Emas Bahasa Inggris Pandawa 2 Competition, 17 Oktober 2024",
      "Medali Emas Biologi Pandawa 2 Competition, 17 Oktober 2024",
      "Medali Emas Pengetahuan Umum Pandawa 2 Competition, 17 Oktober 2024",
      "Medali Emas Wawasan Kebangsaan Pandawa 2 Competition, 17 Oktober 2024"
    ],
    "2023": [
      "Medali Perunggu Sains Level 4 SMP Grand Final Nasional Kompetisi Matematika Sains Inggris KMSI, 17 Desember 2023",
      "Bronze Medal Sains SMP Final Provinsi OMNAS 13, 20 Desember 2023",
      "Bronze Medal Bahasa Inggris SMP Final Provinsi OMNAS 13, 10 Desember 2023",
      "Medali Emas Sains SMP Final Provinsi KMSI, 27 Oktober 2023",
      "Medali Perunggu Bahasa Inggris SMP Final Provinsi KMSI, 27 Oktober 2023"
    ],
    "2022": [
      "Medali Perunggu IPA SMP Kompetisi Sains Madrasah Tahun 2022 Tingkat Nasional, 14 Oktober 2022",
      "Juara 1 IPA SMP Kompetisi Sains Madrasah Tahun 2022 Tingkat Provinsi, 12 September 2022",
      "Juara 2 IPA SMP Kompetisi Sains Madrasah Tahun 2022 Tingkat Kabupaten, 18 Agustus 2022",
      "Medali Perak Sains SMP Final Provinsi OMNAS 11, 3 Juli 2022",
      "Silver Award Hong Kong International Science Olympiad, Maret 2022",
      "Bronze Award SMP Galileo Alchemist Competition",
      "Medali Perunggu SMP Final IMSC 1, 9 Januari 2022"
    ],
    "2021": [
      "Medali Perak Sains SMP Penyisihan IMSC 1, 28 November 2021",
      "Medali Perunggu Sains SD 6 Final OMNAS 10 Nasional, 8 Agustus 2021",
      "Juara Harapan 1 Tematik SD 6 Final Siswa Berprestasi Tingkat Nasional 2021, 18 April 2021",
      "Juara 3 Sains SD 6 Final Siswa Berprestasi Tingkat Nasional 2021, 18 April 2021",
      "Medali Perak Tematik SD 6 Siswa Berprestasi Tingkat Nasional, 28 Maret 2021",
      "Medali Perak Sains SD 6 Siswa Berprestasi Tingkat Nasional, 28 Maret 2021",
      "Medali Perak Sains Level 3 Final Provinsi OMNAS 10, 21 Maret 2021",
      "Juara 3 Sains SD 6 Tingkat Nasional Olimpiade Pelajar Nasional, 31 Januari 2021",
      "Peringkat 7 Tematik SD 6 Tingkat Nasional Olimpiade Pelajar Nasional, 31 Januari 2021",
      "Diamond Award Science SD 6 Olimpiade Pelajar Nasional, 24 Januari 2021",
      "Gold Award Tematik SD 6 Olimpiade Pelajar Nasional, 24 Januari 2021"
    ],
    "2020": [
      "Bronze Award Winner Matematika SD 6 Student Challenge, 20 Desember 2020",
      "Gold Award Winner Science SD 6 Student Challenge, 20 Desember 2020",
      "Bronze Science SD 6 International Science Contest, 17 Oktober 2020",
      "Juara 1 Tematik SD 6 Yogyakarta Back to Competition, 13 September 2020",
      "Juara 1 Sains SD 6 Yogyakarta Back to Competition, 13 September 2020",
      "The Best Ten Sains Grand Final Festival Anak Berprestasi Indonesia, 30 Agustus 2020",
      "Juara 1 Tematik SD 5 Junior Student Academy Tingkat Nasional, 9 Agustus 2020",
      "Juara 1 Sains SD 5 Junior Student Academy Tingkat Nasional, 9 Agustus 2020",
      "Juara 3 Science SD 5 Junior Student Academy Tingkat Nasional, 9 Agustus 2020",
      "Juara 1 Sains SD 5 Nasional Indonesia Best Student, 28 Juni 2020",
      "Juara 3 Tematik SD 5 Nasional Indonesia Best Student, 28 Juni 2020",
      "Juara 1 IPA OSN SD Tingkat Kabupaten Bantul, 20 Maret 2020",
      "Gold Award Sains SD 5 Indonesia Best Student, 8 Maret 2020",
      "Gold Award Tematik SD 5 Indonesia Best Student, 8 Maret 2020",
      "Juara 2 Sains SD 5 Kompetisi MIPA, 23 Februari 2020",
      "Juara Umum SD 5 Festival Back to School, 12 Januari 2020",
      "Juara 1 Tematik SD 5 Festival Back to School, 12 Januari 2020",
      "Juara 1 Sains SD 5 Festival Back to School, 12 Januari 2020"
    ],
    "2019": [
      "Juara Harapan 2 Final Nasional Science SD 5 Indonesia Student Award, 22 Desember 2019",
      "Juara 1 Sains SD 5 Jogja Best Student, 8 Desember 2019",
      "Juara 3 Tematik SD 5 Jogja Best Student, 8 Desember 2019",
      "Juara 1 Sains SD 5 Final Nasional Super Brain Academy, 10 November 2019",
      "Juara 3 Tematik SD 5 Final Nasional Super Brain Academy, 10 November 2019",
      "Diamond Award Science SD 5 Indonesia Student Award, 13 Oktober 2019",
      "Juara 1 Sains SD 4 Olimpiade Pelajar Nasional, 6 April 2019",
      "Gold Award Tematik SD 4 Olimpiade Pelajar Nasional, 6 April 2019",
      "Gold Award Sains SD 4 Olimpiade Pelajar Nasional, 6 April 2019",
      "Bronze Award, International Science Competition, 23 Mei 2019",
      "Best Ten Sains SD 4 Olimpiade Pelajar Nasional, 23 Juni 2019",
      "Juara 1 Tematik SD 4 Olimpiade Pelajar Nasional, 23 Juni 2019",
      "Juara 2 Tematik SD 5 Super Brain Academy Jateng DIY, 18 Agustus 2019",
      "Juara 1 Sains SD 5 Super Brain Academy Jateng DIY, 18 Agustus 2019",
      "Gold Award Sains SD 4 Olimpiade Pelajar Nasional, 6 April 2019",
      "Juara 1 Sains SD 4 KFC Super Champ, 17 Maret 2019",
      "Juara 1 Tematik SD 4 KFC Super Champ, 17 Maret 2019",
      "Medali Emas Sains, Final Nasional OMNAS 8, 31 Maret 2019",
      "Juara 2 Sains SD Satu Pena"
    ]
  };

  const birthDate = new Date("2009-04-08");
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const liveCounter = `${years} years, ${months} months, and ${days} days`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Abyan's Profile</title>
      <link rel="icon" href="https://i.imgur.com/banKsj6.png" type="image/png">
      
      <link href="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js"></script>

      <style>
          :root {
              --bg-primary: #121212;
              --bg-secondary: #F5F5F5;
              --text-primary: #FFF;
              --text-secondary: #b0b0b0;
              --accent-color: #4fc3f7;
              --hover-color: #03a9f4;
          }
  
          body {
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;
              background: var(--bg-primary);
              color: var(--text-primary);
              display: flex;
              flex-direction: column;
              align-items: center;
              position: relative;
              overflow-x: hidden;
              min-height: 100vh;
              padding-bottom: env(safe-area-inset-bottom);
              transition: background-color 0.3s ease, color 0.3s ease;
          }
  
          body.light-mode {
              --bg-primary: #f4f4f4;
              --bg-secondary: #ffffff;
              --text-primary: #333;
              --text-secondary: #666;
              --accent-color: #1976d2;
              --hover-color: #2196f3;
          }
  
          .search-container {
              display: flex;
              justify-content: center;
              margin: 20px 0;
              width: 100%;
              max-width: 800px;
              position: relative;
          }
  
          #achievement-search {
              width: 100%;
              padding: 12px 40px 12px 16px;
              border-radius: 30px;
              border: 2px solid var(--accent-color);
              background-color: var(--bg-primary);
              color: var(--text-primary);
              font-size: 1rem;
              transition: all 0.3s ease;
              outline: none;
          }
          
          #achievement-search.light {
              background-color: var(--bg-seccondary);
          }
  
          #achievement-search:focus {
              box-shadow: 0 0 10px rgba(79, 195, 247, 0.3);
          }
  
          .search-icon {
              position: absolute;
              right: 16px;
              top: 50%;
              transform: translateY(-50%);
              color: var(--accent-color);
              pointer-events: none;
          }
  
          .theme-toggle {
              position: fixed;
              top: 10px;
              right: 16px;
              background-color: var(--bg-secondary);
              color: var(--text-primary);
              border: none;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              transition: all 0.3s ease;
              z-index: 1000;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
  
          .theme-toggle:hover {
              transform: scale(1.1);
              background-color: var(--accent-color);
          }
          
          .theme-toggle {
              background-color: var(--bg-primary);
           }
  
          body.light-mode h1 {
              color: #1a1a1a;
          }
  
          body.light-mode p {
              color: #333;
          }
  
          .theme-toggle:hover {
              transform: scale(1.1);
              background-color: var(--accent-color);
          }
  
          .achievement.hidden {
              display: none !important;
          }
  
          .navbar {
              background: rgba(0, 0, 0, 0.95);
              color: var(--text-primary);
          }
  
          .achievements {
              background: var(--bg-secondary);
          }
  
           ::-webkit-scrollbar {
              width: 8px;
          }
  
          ::-webkit-scrollbar-track {
            background: #1c1c1c;
          }
  
          ::-webkit-scrollbar-thumb {
            background-color: #4fc3f7;
            border-radius: 4px;
            border: 2px solid #1c1c1c;
          }
  
          ::-webkit-scrollbar-thumb:hover {
            background-color: #03a9f4;
          }
    
          #particles-js {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100vh;
              z-index: -1;
              pointer-events: none;
          }
    
          h1 {
              margin: 16px 8px;
              font-size: clamp(1.8rem, 5vw, 2.5rem);
              color: #e0e0e0;
              text-align: center;
              line-height: 1.2;
          }
    
          p {
              margin: 12px 16px;
              color: #b0b0b0;
              font-size: clamp(0.9rem, 4vw, 1rem);
              line-height: 1.5;
              text-align: center;
          }
  
          .navbar {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              background: rgba(0, 0, 0, 0.95);
              padding: 12px 16px;
              display: flex;
              justify-content: flex-start;
              align-items: center;
              z-index: 100;
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              transition: background-color 0.3s ease;
          }
    
          .navbar a {
              color: white;
              text-decoration: none;
              font-size: 1rem;
              margin-right: 20px;
              padding: 8px 12px;
              border-radius: 6px;
              transition: 
                  background-color 0.3s ease,
                  transform 0.2s ease,
                  color 0.3s ease;
              position: relative;
          }
    
          .navbar a::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 2px;
              background-color: transparent;
              transition: background-color 0.3s ease;
          }
    
          .navbar a:hover::after,
          .navbar a:focus::after {
              background-color: white;
          }
    
          .navbar a:hover,
          .navbar a:focus {
              transform: scale(1.05);
              color: #4fc3f7;
          }
    
          .navbar a:active {
              transform: scale(0.95);
              background-color: rgba(255, 255, 255, 0.1);
          }
  
          .container {
              position: relative;
              z-index: 2;
              width: 100%;
              max-width: 800px;
              padding: 16px;
              text-align: center;
              margin-top: 60px;
              margin-bottom: 32px;
          }
    
          .media-container {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: 16px;
              justify-content: center;
              margin: 20px auto;
              padding: 0 8px;
              width: 100%;
          }
    
          .instagram-embed, 
          .profile-image {
             width: 100%;
             height: 400px;
             border-radius: 12px;
             object-fit: cover;
             transition: filter 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

         body:not(.light-mode) .instagram-embed,
         body:not(.light-mode) .profile-image {
             filter: brightness(0.5) contrast(1.2);
        }

        body:not(.light-mode) .instagram-embed:hover,
        body:not(.light-mode) .profile-image:hover {
          transform: scale(1.04);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        body.light-mode .instagram-embed {
            filter: none;
        }

        body.light-mode .profile-image {
            filter: brightness(0.9) contrast(0.9);
        }

        body.light-mode .instagram-embed:hover,
        body.light-mode .profile-image:hover {
          transform: scale(1.04);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

    @media (max-width: 480px) {
    body {
        padding-left: 8px;
        padding-right: 8px;
        line-height: 1.4;
    }

    .navbar {
        padding: 10px 8px;
        justify-content: center;
    }

    .navbar a {
        font-size: 0.85rem;
        padding: 6px 8px;
        margin-right: 6px;
    }

    .container {
        margin-top: 50px;
        padding: 4px;
    }

    h1 {
        font-size: clamp(1.5rem, 4vw, 2.2rem);
        margin: 12px 4px;
    }

    p {
        font-size: clamp(0.8rem, 3.5vw, 0.95rem);
        margin: 8px 4px;
    }

    .media-container {
        grid-template-columns: 1fr;
        gap: 16px;
        width: 100%;
        padding: 0 16px;
        box-sizing: border-box;
    }

    .instagram-embed, 
    .profile-image {
        height: 310px;
        width: 100%;
        object-fit: cover;
        max-width: 100%;
        filter: brightness(0.5) contrast(1.2);
    }

    .instagram-embed.light {
        filter: none;
    }

    .profile-image.light {
        filter: brightness(0.9) contrast(0.9)
    }

    .media-container iframe,
    .media-container img {
        aspect-ratio: 16 / 9;
        max-height: 350px;
        min-height: 250px;
        border-radius: 12px;
    }

    .achievements {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        width: calc(100% - 32px);
        margin: 16px auto;
        padding: 12px;
        box-sizing: border-box;
    }

    .year-group {
        width: 100%;
        max-width: 340px;
        text-align: right;
    }

    .year-title {
        text-align: right;
        width: 100%;
    }

    .achievement {
        width: 100%;
        box-sizing: border-box;
        margin: 8px 0;
        padding: 10px;
        text-align: right;
    }

    .contact-button {
        bottom: 15px;
        position: relative;
        right: 16px;
        padding: 10px 16px;
        font-size: 0.9rem;
    }

    .search-icon {
        right: 12px;
    }

    #achievement-search {
        padding: 12px 12px 12px 36px;
    }
        
    .theme-toggle {
        top: 6px;
    }
}

@media (min-width: 481px) and (max-width: 768px) {
    .media-container {
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 20px;
    }

    .navbar a {
        font-size: 0.95rem;
    }
}

    
          .achievements {
              max-height: 70vh;
              overflow-y: auto;
              background: #1c1c1c;
              padding: 16px;
              border-radius: 12px;
              margin: 20px 8px;
              width: calc(100% - 16px);
              -webkit-overflow-scrolling: touch;
              scrollbar-width: thin;
              scrollbar-color: #4fc3f7 #1c1c1c;
              transition: background-color 0.3s ease;
          }
    
          .achievements:hover {
              background-color: #252525;
          }
    
          .year-group {
              margin-bottom: 20px;
              padding: 0 8px;
              opacity: 0;
              transform: translateY(20px);
              transition: opacity 0.6s ease, transform 0.6s ease;
          }
    
          .year-group.aos-animate {
              opacity: 1;
              transform: translateY(0);
          }
    
          .year-title {
              color: #e0e0e0;
              font-size: 1.1rem;
              margin: 16px 0;
              font-weight: 600;
              text-align: left;
              transition: color 0.3s ease;
          }
    
          .year-group:hover .year-title {
              color: #4fc3f7;
          }
    
          .achievement {
              margin: 12px 0;
              padding: 8px;
              color: #8c8c8c;
              font-size: 0.9rem;
              text-align: left;
              line-height: 1.4;
              border-left: 2px solid #333;
              background: rgba(255, 255, 255, 0.03);
              border-radius: 0 4px 4px 0;
              transition: 
                  opacity 0.5s ease, 
                  transform 0.5s ease,
                  background-color 0.3s ease,
                  border-left-color 0.3s ease,
                  color 0.3s ease;
              will-change: opacity, transform;
          }
    
          .achievement:hover {
              background-color: rgba(255, 255, 255, 0.06);
              border-left-color: #4fc3f7;
              color: #b0b0b0;
          }
    
          .aos-animate {
              opacity: 1 !important;
          }

          .contact-button {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background-color: #1c1c1c;
              color: white;
              padding: 12px 20px;
              border-radius: 30px;
              text-decoration: none;
              font-weight: 600;
              z-index: 1000;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
              transition: 
                  transform 0.3s ease, 
                  background-color 0.3s ease,
                  box-shadow 0.3s ease;
          }
  
          .contact-button:hover {
              background-color: #4fc3f7;
              transform: scale(1.05);
              box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
          }
  
          .contact-button:active {
              transform: scale(0.95);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
      </style>
  </head>
  <body>
      <div id="particles-js"></div>
    
      <div class="navbar">
        <a href="https://blog.abyn.xyz" target="_blank">Blog</a>
        <a href="https://note.abyn.xyz" target="_blank">Note</a>
      </div>
  
      <button class="theme-toggle" aria-label="Toggle Dark/Light Mode" aria-pressed="false">
        🌓
        </button>
    
      <div id="main-content" class="container loading">
        <h1 data-aos="fade-down">Abyan's Profile</h1>
        <p data-aos="fade-up" data-aos-delay="200">Hi! My name is Abyan. I'm a 10th grader, and I'm ${liveCounter} old. Take a look at my profile!</p>
    
        <div class="media-container">
          <iframe
            src="https://www.instagram.com/abyb.1/embed"
            class="instagram-embed"
            frameborder="0"
            scrolling="no"
            allowtransparency="true"
            data-aos="zoom-in"
            data-aos-delay="400">
          </iframe>
          <img src="https://i.imgur.com/UUigaWa.jpeg" alt="Abyan's Image" class="profile-image" loading="lazy" data-aos="zoom-in" data-aos-delay="600">
        </div>
  
        <div class="search-container" data-aos="zoom-in-up" data-aos-delay="200">
            <input type="text" id="achievement-search" placeholder="Search achievements..." aria-label="Search Achievements">
            <span class="search-icon">🔍</span>
        </div>

    
        <h2 data-aos="fade-up" data-aos-delay="800">Achievements</h2>
        <div class="achievements" data-aos="fade-up" data-aos-delay="1000">
          ${Object.keys(groupedAchievements)
            .sort((a, b) => b - a)
            .map((year) => `
              <div class="year-group">
                <div class="year-title">${year}</div>
                ${groupedAchievements[year]
                  .map((achievement) => `<div class="achievement">${achievement}</div>`)
                  .join("")}
              </div>
            `)
            .join("")}
        </div>
      </div>
      <a href="mailto:abyn@abyn.xyz" target="_blank" class="contact-button" data-aos="fade-up" data-aos-delay="1200">
          Contact Me
      </a>
      
      <script src="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0"></script>
      
      <script>
        AOS.init();
  
        function initializeParticles(theme) {
          const particleColor = theme === 'light' ? '#121212' : '#ffffff';
          const lineLinkedColor = theme === 'light' ? '#1976d2' : '#ffffff';
          const lineLinkedopacity = theme === 'light' ? '1' : '0.4'

          particlesJS("particles-js", {
            particles: {
              number: { value: 50, density: { enable: true, value_area: 800 } },
              shape: { type: "circle", stroke: { width: 0, color: particleColor } },
              opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1 } },
              size: { value: 3, random: true, anim: { enable: true, speed: 4, size_min: 0.1 } },
              line_linked: {
                enable: true,
                distance: 150,
                color: lineLinkedColor,
                opacity: lineLinkedopacity,
                width: 1
              },
              move: {
                enable: true,
                speed: 3,
                direction: "random",
                random: true,
                straight: false,
                out_mode: "out"
              }
            },
            interactivity: {
              detect_on: "window",
              events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" },
                resize: true
              }
            },
            retina_detect: true
          });
        }

        document.addEventListener('DOMContentLoaded', () => {
          const themeToggle = document.querySelector('.theme-toggle');
          const body = document.body;

          let currentTheme = localStorage.getItem('theme') || 'dark';
          if (currentTheme === 'light') {
            body.classList.add('light-mode');
          }

          initializeParticles(currentTheme);

          themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';

            localStorage.setItem('theme', currentTheme);

            initializeParticles(currentTheme);
          });
        });

  
        document.addEventListener('DOMContentLoaded', () => {
          const achievementGroups = document.querySelectorAll('.year-group');
          
          const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
          };
  
          const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                const achievements = entry.target.querySelectorAll('.achievement');
                achievements.forEach((achievement, index) => {
                  achievement.style.opacity = '0';
                  achievement.style.transform = 'translateX(-20px)';
                  
                  setTimeout(() => {
                    achievement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    achievement.style.opacity = '1';
                    achievement.style.transform = 'translateX(0)';
                  }, index * 100);
                });
                
                observer.unobserve(entry.target);
              }
            });
          }, observerOptions);
  
          achievementGroups.forEach(group => {
            group.classList.remove('aos-animate');
            const achievements = group.querySelectorAll('.achievement');
            achievements.forEach(achievement => {
              achievement.style.opacity = '0';
              achievement.style.transform = 'translateX(-20px)';
            });
            observer.observe(group);
          });
  
          const searchInput = document.getElementById('achievement-search');
          const achievements = document.querySelectorAll('.achievement');
  
          searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
  
            achievements.forEach(achievement => {
              const text = achievement.textContent.toLowerCase();
              if (text.includes(searchTerm)) {
                achievement.classList.remove('hidden');
              } else {
                achievement.classList.add('hidden');
              }
            });
          });
  
          window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 10) {
              navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            } else {
              navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            }
          });
        });
      </script>
  </body>
  </html>
  `;

  response.setHeader('Content-Type', 'text/html; charset=UTF-8');
  response.setHeader('Cache-Control', 'public, max-age=3600');
  response.send(html);
}
