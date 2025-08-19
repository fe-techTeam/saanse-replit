import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "mr", name: "मराठी" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-4 h-4 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32 border-none bg-transparent text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}