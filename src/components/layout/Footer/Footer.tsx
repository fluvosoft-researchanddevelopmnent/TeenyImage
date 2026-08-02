import Typography from "@mui/material/Typography";

import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-surface py-8">
      <Container className="text-center">
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} TeenyPDF. Built with Next.js, MUI &amp; Tailwind.
        </Typography>
      </Container>
    </footer>
  );
}
