export type Language = 'en' | 'tr' | 'fr' | 'de' | 'es';

export const translations = {
    en: {
        appTitle: "Video to PDF",
        appSubtitle: "AI-Powered Video Summarizer",
        inputLabel: "YouTube Video Links",
        inputPlaceholder: "https://www.youtube.com/watch?v=...",
        enterUrlHint: "Enter one URL per line.",
        publicVideoHint: "Public videos only",
        summaryLength: "Summary Detail Level",
        lengths: {
            short: "Short",
            medium: "Medium",
            comprehensive: "Comprehensive"
        },
        generateBtn: "Generate Summaries",
        stopBtn: "Stop Analysis",
        howItWorks: "How it works",
        steps: {
            paste: { title: "Paste URL", desc: "Input any public YouTube link." },
            analyze: { title: "AI Analysis", desc: "Gemini AI watches and analyzes." },
            summary: { title: "Get Summary", desc: "Receive a detailed summary." },
            export: { title: "Export PDF", desc: "Download for offline reading." }
        },
        footer: {
            poweredBy: "Powered by Google Gemini",
            version: "Version 0.5 • Free & Open Source"
        },
        buttons: {
            gotIt: "Got it",
            save: "Save Settings",
            settings: "Settings",
            about: "About this application",
            theme: "Toggle theme"
        },
        settings: {
            title: "Settings",
            apiKeyLabel: "Gemini API Key",
            apiKeyPlaceholder: "Enter your Gemini API Key",
            getKeyLink: "Get your free API key here",
            modelLabel: "Select AI Model"
        },
        errors: {
            invalidUrl: "Invalid YouTube URL format detected",
            noUrl: "Please enter at least one YouTube URL.",
            validationError: "An unknown validation error occurred.",
            aiError: "Failed to analyze video.",
            apiKeyEmptyError: "API Key cannot be empty"
        }
    },
    tr: {
        appTitle: "Video'dan PDF'e",
        appSubtitle: "AI Destekli Video Özetleyici",
        inputLabel: "YouTube Video Linkleri",
        inputPlaceholder: "https://www.youtube.com/watch?v=...",
        enterUrlHint: "Her satıra bir link girin.",
        publicVideoHint: "Sadece herkese açık videolar",
        summaryLength: "Özet Detay Seviyesi",
        lengths: {
            short: "Kısa",
            medium: "Orta",
            comprehensive: "Kapsamlı"
        },
        generateBtn: "Özet Oluştur",
        stopBtn: "Analizi Durdur",
        howItWorks: "Nasıl Çalışır?",
        steps: {
            paste: { title: "Link Yapıştır", desc: "Herhangi bir YouTube linki girin." },
            analyze: { title: "AI Analizi", desc: "Gemini AI izler ve analiz eder." },
            summary: { title: "Özet Al", desc: "Saniyeler içinde detaylı özet alın." },
            export: { title: "PDF İndir", desc: "Çevrimdışı okumak için indirin." }
        },
        footer: {
            poweredBy: "Google Gemini tarafından desteklenmektedir",
            version: "Sürüm 0.5 • Ücretsiz ve Açık Kaynak"
        },
        buttons: {
            gotIt: "Anladım",
            save: "Ayarları Kaydet",
            settings: "Ayarlar",
            about: "Uygulama hakkında",
            theme: "Temayı değiştir"
        },
        settings: {
            title: "Ayarlar",
            apiKeyLabel: "Gemini API Anahtarı",
            apiKeyPlaceholder: "Gemini API Anahtarınızı girin",
            getKeyLink: "Ücretsiz API anahtarınızı buradan alın",
            modelLabel: "AI Modeli Seç"
        },
        errors: {
            invalidUrl: "Geçersiz YouTube URL formatı algılandı",
            noUrl: "Lütfen en az bir YouTube URL'si girin.",
            validationError: "Bilinmeyen bir doğrulama hatası oluştu.",
            aiError: "Video analiz edilemedi.",
            apiKeyEmptyError: "API Anahtarı boş olamaz"
        }
    },
    fr: {
        appTitle: "Vidéo en PDF",
        appSubtitle: "Résumé Vidéo par IA",
        inputLabel: "Liens Vidéo YouTube",
        inputPlaceholder: "https://www.youtube.com/watch?v=...",
        enterUrlHint: "Entrez une URL par ligne.",
        publicVideoHint: "Vidéos publiques uniquement",
        summaryLength: "Niveau de Détail",
        lengths: {
            short: "Court",
            medium: "Moyen",
            comprehensive: "Complet"
        },
        generateBtn: "Générer des Résumés",
        stopBtn: "Arrêter l'Analyse",
        howItWorks: "Comment ça marche",
        steps: {
            paste: { title: "Coller l'URL", desc: "Entrez un lien YouTube public." },
            analyze: { title: "Analyse IA", desc: "Gemini IA regarde et analyse." },
            summary: { title: "Obtenir le Résumé", desc: "Recevez un résumé détaillé." },
            export: { title: "Exporter PDF", desc: "Télécharger pour lire hors ligne." }
        },
        footer: {
            poweredBy: "Propulsé par Google Gemini",
            version: "Version 0.5 • Gratuit & Open Source"
        },
        buttons: {
            gotIt: "Compris",
            save: "Enregistrer",
            settings: "Paramètres",
            about: "À propos de l'application",
            theme: "Changer de thème"
        },
        settings: {
            title: "Paramètres",
            apiKeyLabel: "Clé API Gemini",
            apiKeyPlaceholder: "Entrez votre clé API Gemini",
            getKeyLink: "Obtenez votre clé API gratuite ici",
            modelLabel: "Sélectionner le Modèle IA"
        },
        errors: {
            invalidUrl: "Format d'URL YouTube invalide détecté",
            noUrl: "Veuillez entrer au moins une URL YouTube.",
            validationError: "Une erreur de validation inconnue s'est produite.",
            aiError: "Échec de l'analyse de la vidéo.",
            apiKeyEmptyError: "La clé API ne peut pas être vide"
        }
    },
    de: {
        appTitle: "Video zu PDF",
        appSubtitle: "KI-gestützte Video-Zusammenfassung",
        inputLabel: "YouTube Video Links",
        inputPlaceholder: "https://www.youtube.com/watch?v=...",
        enterUrlHint: "Geben Sie eine URL pro Zeile ein.",
        publicVideoHint: "Nur öffentliche Videos",
        summaryLength: "Zusammenfassungs-Detail",
        lengths: {
            short: "Kurz",
            medium: "Mittel",
            comprehensive: "Umfassend"
        },
        generateBtn: "Zusammenfassungen Erstellen",
        stopBtn: "Analyse Stoppen",
        howItWorks: "Wie es funktioniert",
        steps: {
            paste: { title: "URL Einfügen", desc: "Geben Sie einen öffentlichen YouTube-Link ein." },
            analyze: { title: "KI-Analyse", desc: "Gemini KI schaut und analysiert." },
            summary: { title: "Zusammenfassung", desc: "Erhalten Sie eine detaillierte Zusammenfassung." },
            export: { title: "PDF Exportieren", desc: "Zum Offline-Lesen herunterladen." }
        },
        footer: {
            poweredBy: "Unterstützt von Google Gemini",
            version: "Version 0.5 • Kostenlos & Open Source"
        },
        buttons: {
            gotIt: "Verstanden",
            save: "Einstellungen Speichern",
            settings: "Einstellungen",
            about: "Über diese Anwendung",
            theme: "Thema umschalten"
        },
        settings: {
            title: "Einstellungen",
            apiKeyLabel: "Gemini API-Schlüssel",
            apiKeyPlaceholder: "Geben Sie Ihren Gemini API-Schlüssel ein",
            getKeyLink: "Holen Sie sich hier Ihren kostenlosen API-Schlüssel",
            modelLabel: "KI-Modell Auswählen"
        },
        errors: {
            invalidUrl: "Ungültiges YouTube-URL-Format erkannt",
            noUrl: "Bitte geben Sie mindestens eine YouTube-URL ein.",
            validationError: "Ein unbekannter Validierungsfehler ist aufgetreten.",
            aiError: "Videoanalyse fehlgeschlagen.",
            apiKeyEmptyError: "API-Schlüssel darf nicht leer sein"
        }
    },
    es: {
        appTitle: "Video a PDF",
        appSubtitle: "Resumidor de Video con IA",
        inputLabel: "Enlaces de Video de YouTube",
        inputPlaceholder: "https://www.youtube.com/watch?v=...",
        enterUrlHint: "Ingrese una URL por línea.",
        publicVideoHint: "Solo videos públicos",
        summaryLength: "Nivel de Detalle",
        lengths: {
            short: "Corto",
            medium: "Medio",
            comprehensive: "Completo"
        },
        generateBtn: "Generar Resúmenes",
        stopBtn: "Detener Análisis",
        howItWorks: "Cómo funciona",
        steps: {
            paste: { title: "Pegar URL", desc: "Ingrese cualquier enlace público de YouTube." },
            analyze: { title: "Análisis IA", desc: "Gemini IA mira y analiza." },
            summary: { title: "Obtener Resumen", desc: "Reciba un resumen detallado." },
            export: { title: "Exportar PDF", desc: "Descargar para leer sin conexión." }
        },
        footer: {
            poweredBy: "Impulsado por Google Gemini",
            version: "Versión 0.5 • Gratis y de Código Abierto"
        },
        buttons: {
            gotIt: "Entendido",
            save: "Guardar Configuración",
            settings: "Configuración",
            about: "Acerca de esta aplicación",
            theme: "Cambiar tema"
        },
        settings: {
            title: "Configuración",
            apiKeyLabel: "Clave API de Gemini",
            apiKeyPlaceholder: "Ingrese su clave API de Gemini",
            getKeyLink: "Obtenga su clave API gratuita aquí",
            modelLabel: "Seleccionar Modelo de IA"
        },
        errors: {
            invalidUrl: "Formato de URL de YouTube no válido detectado",
            noUrl: "Por favor, ingrese al menos una URL de YouTube.",
            validationError: "Ocurrió un error de validación desconocido.",
            aiError: "Error al analizar el video.",
            apiKeyEmptyError: "La clave API no puede estar vacía"
        }
    }
};
