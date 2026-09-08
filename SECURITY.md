# SECURITY – BG-RehaManager Südwest

## Grundprinzipien

1. Keine GitHub-Personal-Access-Tokens, Passwörter, privaten Schlüssel oder sonstigen Zugangsdaten in `index.html`, JavaScript, `data.json` oder anderen öffentlich ausgelieferten Dateien speichern.
2. Schreibzugriffe auf GitHub künftig ausschließlich über eine serverseitige, authentifizierte Komponente (bevorzugt GitHub App / kurzlebige Tokens).
3. Der öffentliche Browser darf nur freigegebene Laufzeitdaten erhalten. Mastertabellen, interne Prüflisten, Backups und Zugangsdaten gehören nicht in das öffentliche Deployment.
4. Änderungen werden vor dem Commit validiert und mit Datensatz-ID, Zeitstempel, Änderungsart und Feldänderungen protokolliert.
5. Datensätze möglichst nicht hart löschen. Standard: `Aktiv` → `Zur Prüfung` → `Archiviert`. Endgültige Löschung nur bewusst im Adminbereich.
6. Für produktive Schreibvorgänge sollte der Server den erwarteten Basis-Commit (`baseSha`) prüfen, damit parallele Änderungen nicht unbemerkt überschrieben werden.

## Geplanter sicherer Schreibweg

Admin-Oberfläche → Authentifizierung → geschützte API → Validierung → GitHub App → Commit auf Datenbranch/Repository → optional Review/Merge → Deployment.

## Nicht zulässig

- fest eingebetteter GitHub-Token im Frontend
- Token in `localStorage`
- private Schlüssel im Repository
- ungeprüfte direkte Überschreibung von `data.json`
- Speicherung personenbezogener Falldaten in der Reha-Einrichtungsdatenbank

## Meldeweg bei Verdacht auf Zugangsdaten-Leck

Zugangsdaten sofort widerrufen/rotieren, betroffene Commits/Dateien prüfen, Deployment stoppen und erst nach Bereinigung wieder freigeben.
