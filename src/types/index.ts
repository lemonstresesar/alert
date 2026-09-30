export type NiveauRisque = 'faible' | 'modéré' | 'élevé' | 'critique';

export type StatutSignalement = 'en attente' | 'validé' | 'rejeté';

export type TypeIncident = 
  | 'Inondation / Crue'
  | 'Effondrement d’immeuble / bâtiment'
  | 'Éboulement / Glissement de terrain'
  | 'Pont / Chaussée coupée'
  | 'Poteau ou câble électrique à terre'
  | 'Collecteur / Caniveau saturé'
  | 'Autre sinistre urbain';

export type TypeAlerte = 
  | 'Crue subite' 
  | 'Forte pluie' 
  | 'Marée haute Wouri' 
  | 'Évacuation préventive' 
  | 'Effondrement / Éboulement'
  | 'Danger électrique & Voirie'
  | 'Vigilance orage';

export type CanalDiffusion = 'SMS' | 'WhatsApp' | 'Notification';

export interface Utilisateur {
  id_utilisateur: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string; // Nom du quartier ou lieu-dit personnalisé
  mot_de_passe: string;
  canaux_preferes?: CanalDiffusion[];
  date_inscription: string;
}

export interface Administrateur {
  id_admin: string;
  nom: string;
  email: string;
  mot_de_passe: string;
  role: 'superadmin' | 'officier_protection_civile';
}

export interface ZoneDeRisque {
  id_zone: string;
  nom_zone: string;
  quartier: string;
  niveau_de_risque: NiveauRisque;
  description: string;
  lat: number;
  lng: number;
  rayon_metres: number;
  est_inonde: boolean;
  est_personnalisee?: boolean;
  cours_eau_proche?: string;
  population_estimee?: number;
  derniere_mise_a_jour?: string;
}

export interface Signalement {
  id_signalement: string;
  id_utilisateur: string;
  nom_auteur: string;
  telephone_auteur: string;
  date: string;
  type_incident?: TypeIncident;
  description: string;
  photo?: string; // base64 string or sample image URL
  statut: StatutSignalement;
  zones_concernees: string[]; // Liste des id_zone
  zone_personnalisee?: string; // Nom de la zone non prédéfinie (ex: "Ndogpassi 3", "PK 14", "Village")
  coordonnees_gps?: { lat: number; lng: number }; // Pointage carte libre
  hauteur_eau?: string; // ex: "Cheville (10-20 cm)", "Genou (30-50 cm)", "Taille (>80 cm)"
  gravite?: 'modéré' | 'grave' | 'critique / urgence vitale';
  note_admin?: string;
}

export interface Alerte {
  id_alerte: string;
  id_admin: string;
  nom_admin: string;
  date_alerte: string;
  type_alerte: TypeAlerte;
  message: string;
  niveau_urgence: NiveauRisque;
  zones_destinataires: string[]; // Liste des id_zone
  zones_libres?: string; // Zones non prédéfinies ciblées
  canaux: CanalDiffusion[];
}

export interface DailyWeatherForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  weatherCode: number;
  riskLevel: NiveauRisque;
  recommendation: string;
}

export interface CurrentWeather {
  temperature: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
  time: string;
  description: string;
}
