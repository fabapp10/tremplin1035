import "./globals.css";

export const metadata = {
  title: "Tremplin — Candidature propulsée par l'IA",
  description: "CV, lettre de motivation, préparation d'entretien et photo : ta candidature, propulsée par l'IA.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
