import Typography from "@mui/material/Typography";

import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-8">
      <Container className="text-center">
        <Typography variant="body2" className="text-text-secondary">
          &copy; {new Date().getFullYear()} TeenyPDF. Built with FluvoSoft.
        </Typography>
      </Container>
    </footer>
  );
}
