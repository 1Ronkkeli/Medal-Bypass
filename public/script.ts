:root {
  /* Light Theme Colors */
  --light-bg: #f8f9fa;
  --light-card-bg: #ffffff;
  --light-text: #212529;
  --light-text-secondary: #6c757d;
  --light-border: #dee2e6;
  --light-primary: #553ea8;
  --light-primary-hover: #4a37a0;
  --light-secondary: #00b786;
  --light-secondary-hover: #00a578;
  --light-accent: #ff9800;
  --light-error: #dc3545;
  --light-success: #28a745;
  --light-shadow: rgba(0, 0, 0, 0.1);

  /* Dark Theme Colors */
  --dark-bg: #121212;
  --dark-card-bg: #1e1e1e;
  --dark-text: #f8f9fa;
  --dark-text-secondary: #adb5bd;
  --dark-border: #343a40;
  --dark-primary: #6a4fd3;
  --dark-primary-hover: #7a5fe3;
  --dark-secondary: #00d9a3;
  --dark-secondary-hover: #00f0b5;
  --dark-accent: #ffb74d;
  --dark-error: #f44336;
  --dark-success: #4caf50;
  --dark-shadow: rgba(0, 0, 0, 0.3);

  /* Common Variables */
  --border-radius-sm: 4px;
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --transition: all 0.3s ease;
  --font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
    "Helvetica Neue", sans-serif;
}

/* Default Theme (Light) */
body {
  --bg: var(--light-bg);
  --card-bg: var(--light-card-bg);
  --text: var(--light-text);
  --text-secondary: var(--light-text-secondary);
  --border: var(--light-border);
  --primary: var(--light-primary);
  --primary-hover: var(--light-primary-hover);
  --secondary: var(--light-secondary);
  --secondary-hover: var(--light-secondary-hover);
  --accent: var(--light-accent);
  --error: var(--light-error);
  --success: var(--light-success);
  --shadow: var(--light-shadow);
}

/* Dark Theme */
body.dark {
  --bg: var(--dark-bg);
  --card-bg: var(--dark-card-bg);
  --text: var(--dark-text);
  --text-secondary: var(--dark-text-secondary);
  --border: var(--dark-border);
  --primary: var(--dark-primary);
  --primary-hover: var(--dark-primary-hover);
  --secondary: var(--dark-secondary);
  --secondary-hover: var(--dark-secondary-hover);
  --accent: var(--dark-accent);
  --error: var(--dark-error);
  --success: var(--dark-success);
  --shadow: var(--dark-shadow);
}

/* Reset & Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
  transition: var(--transition);
  min-height: 100vh;
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: var(--transition);
}

a:hover {
  color: var(--primary-hover);
}

/* Layout */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo i {
  font-size: 1.75rem;
  color: var(--primary);
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
}

main {
  flex: 1;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero {
  text-align: center;
  margin-bottom: 1rem;
}

.hero h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.card {
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px var(--shadow);
  padding: 2rem;
  transition: var(--transition);
}

.input-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 1px solid var(--border);
  border-radius: var(--border-radius);
  background-color: var(--card-bg);
  color: var(--text);
  font-size: 1rem;
  transition: var(--transition);
}

input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(106, 79, 211, 0.2);
}

button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

button:hover {
  background-color: var(--primary-hover);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading {
  height: 24px;
  text-align: center;
  font-weight: 500;
  color: var(--secondary);
  margin-bottom: 1rem;
  display: none;
}

.help-section {
  text-align: center;
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.help-link:hover {
  color: var(--primary);
}

.videos-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.video {
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px var(--shadow);
  padding: 1.5rem;
  transition: var(--transition);
}

.video video {
  width: 100%;
  border-radius: var(--border-radius-sm);
  margin-bottom: 1rem;
  background-color: #000;
}

.video a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--secondary);
  color: white;
  border-radius: var(--border-radius);
  font-weight: 600;
  transition: var(--transition);
}

.video a:hover {
  background-color: var(--secondary-hover);
}

footer {
  margin-top: auto;
  padding: 2rem 0;
  border-top: 1px solid var(--border);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.footer-links a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.footer-links a:hover {
  color: var(--primary);
}

.footer-credits {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.creator {
  margin-bottom: 0.5rem;
}

.hosting a {
  color: var(--text-secondary);
}

.syntrel {
  font-weight: 700;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Theme Switch */
.theme-toggle {
  position: relative;
}

.theme-switch {
  opacity: 0;
  position: absolute;
}

.theme-switch-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem;
  width: 3.5rem;
  height: 1.75rem;
  background-color: var(--card-bg);
  border-radius: 50px;
  position: relative;
  cursor: pointer;
  box-shadow: 0 2px 5px var(--shadow);
}

.theme-switch-label i {
  font-size: 0.875rem;
  transition: var(--transition);
}

.fa-sun {
  color: #f39c12;
}

.fa-moon {
  color: #3498db;
}

.slider {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: var(--primary);
  transition: var(--transition);
}

.theme-switch:checked + .theme-switch-label .slider {
  transform: translateX(1.75rem);
}

/* Responsive */
@media (max-width: 768px) {
  .input-container {
    flex-direction: column;
  }

  .hero h2 {
    font-size: 1.5rem;
  }

  .hero p {
    font-size: 1rem;
  }

  .card {
    padding: 1.5rem;
  }

  .footer-links {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .logo h1 {
    font-size: 1.25rem;
  }

  .hero h2 {
    font-size: 1.25rem;
  }

  .card {
    padding: 1rem;
  }
}

