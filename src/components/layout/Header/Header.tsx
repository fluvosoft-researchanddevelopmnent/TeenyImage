import Link from "next/link";
import { FileText } from "lucide-react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/layout/Container";

export function Header() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="border-b border-black/5 bg-surface/80 backdrop-blur-md"
      color="transparent"
    >
      <Container as="div">
        <Toolbar disableGutters className="min-h-16 justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 no-underline text-inherit">
            <Icon icon={FileText} size={24} className="text-primary" />
            <Typography variant="h6" component="span" className="font-bold">
              TeenyPDF
            </Typography>
          </Link>

          <nav className="flex items-center gap-2">
            <Button variant="text" color="inherit">
              Tools
            </Button>
            <Button variant="contained" size="small">
              Upload PDF
            </Button>
          </nav>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
