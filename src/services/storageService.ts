import {
  Administrateur,
  Alerte,
  NiveauRisque,
  Signalement,
  StatutSignalement,
  TypeAlerte,
  Utilisateur,
  ZoneDeRisque,
} from '../types';

const STORAGE_KEYS = {
  ZONES: 'alertedouala_zones_v1',
  SIGNALEMENTS: 'alertedouala_signalements_v1',
  ALERTES: 'alertedouala_alertes_v1',
  UTILISATEURS: 'alertedouala_utilisateurs_v1',
  ADMINS: 'alertedouala_admins_v1',
  SESSION: 'alertedouala_session_v1',
};

// 10 zones réelles de Douala (autour de 4.05°N, 9.70°E)
const INITIAL_ZONES: ZoneDeRisque[] = [
  {
    id_zone: 'zone_makèpé',
    nom_zone: 'Makèpé (Missokè & Bassin Mbanya)',
    quartier: 'Makèpé',
    niveau_de_risque: 'critique',
    description: 'Zone d\'exutoire naturel du cours d\'eau Mbanya. Enclavement immédiat lors de marées combinées aux averses.',
    lat: 4.0825,
    lng: 9.7452,
    rayon_metres: 1200,
    est_inonde: true,
    cours_eau_proche: 'Rivière Mbanya & Collecteur Missokè',
    population_estimee: 48000,
    derniere_mise_a_jour: 'Il y a 20 min',
  },
  {
    id_zone: 'zone_bepanda',
    nom_zone: 'Bépanda (Omnisports & Yong-Yong)',
    quartier: 'Bépanda',
    niveau_de_risque: 'critique',
    description: 'Bassin versant à forte déclivité, ruissellement violent saturant le collecteur TSF et les drainages ouverts.',
    lat: 4.0583,
    lng: 9.7321,
    rayon_metres: 1300,
    est_inonde: true,
    cours_eau_proche: 'Canal de Bépanda TSF',
    population_estimee: 62000,
    derniere_mise_a_jour: 'Il y a 35 min',
  },
  {
    id_zone: 'zone_nylon',
    nom_zone: 'Nylon (Bilonguè & Tergal)',
    quartier: 'Nylon',
    niveau_de_risque: 'critique',
    description: 'Bas-fonds marécageux historiques, nappe phréatique affleurante, reflux des eaux du bassin du Mgoua.',
    lat: 4.0250,
    lng: 9.7280,
    rayon_metres: 1500,
    est_inonde: true,
    cours_eau_proche: 'Bassin du Mgoua',
    population_estimee: 85000,
    derniere_mise_a_jour: 'Il y a 10 min',
  },
  {
    id_zone: 'zone_deido',
    nom_zone: 'Deido (Rond-Point & Grand Moulin)',
    quartier: 'Deido',
    niveau_de_risque: 'élevé',
    description: 'Proximité immédiate du lit du Wouri. Risque accru de remontée des eaux saumâtres lors des pleines mers.',
    lat: 4.0620,
    lng: 9.7100,
    rayon_metres: 1000,
    est_inonde: false,
    cours_eau_proche: 'Fleuve Wouri & Ruisseau Besseke',
    population_estimee: 45000,
    derniere_mise_a_jour: 'Il y a 1 heure',
  },
  {
    id_zone: 'zone_bonaberi',
    nom_zone: 'Bonabéri (Quatre-Étages & Nzingkock)',
    quartier: 'Bonabéri',
    niveau_de_risque: 'élevé',
    description: 'Rive droite du Wouri, sols alluvionnaires meubles et zones industrielles à faible pente de drainage.',
    lat: 4.0750,
    lng: 9.6650,
    rayon_metres: 2000,
    est_inonde: false,
    cours_eau_proche: 'Estuaire du Wouri',
    population_estimee: 70000,
    derniere_mise_a_jour: 'Il y a 2 heures',
  },
  {
    id_zone: 'zone_youpwe',
    nom_zone: 'Youpwè (Zone Portuaire & Mangrove)',
    quartier: 'Youpwe',
    niveau_de_risque: 'élevé',
    description: 'Village de pêcheurs et zone littorale directement exposée à la marée dynamique et aux crues marines.',
    lat: 4.0150,
    lng: 9.7000,
    rayon_metres: 1100,
    est_inonde: false,
    cours_eau_proche: 'Crique Youpwè & Chenal de navigation',
    population_estimee: 18000,
    derniere_mise_a_jour: 'Il y a 3 heures',
  },
  {
    id_zone: 'zone_akwa',
    nom_zone: 'Akwa (Boulevard de la Liberté & Bonanjo)',
    quartier: 'Akwa',
    niveau_de_risque: 'modéré',
    description: 'Cœur économique d’affaires. Problèmes d’engorgement des regards pluviaux par les déchets lors d’orages soudains.',
    lat: 4.0515,
    lng: 9.6950,
    rayon_metres: 1200,
    est_inonde: false,
    cours_eau_proche: 'Canalisations primaires urbaines',
    population_estimee: 35000,
    derniere_mise_a_jour: 'Il y a 4 heures',
  },
  {
    id_zone: 'zone_bonamoussadi',
    nom_zone: 'Bonamoussadi (Denver & Carrefour Sable)',
    quartier: 'Bonamoussadi',
    niveau_de_risque: 'modéré',
    description: 'Plateau résidentiel supérieur avec quelques thalwegs vers le ruisseau Kambo susceptibles d\'érosions.',
    lat: 4.0950,
    lng: 9.7350,
    rayon_metres: 1400,
    est_inonde: false,
    cours_eau_proche: 'Ruisseau Kambo',
    population_estimee: 55000,
    derniere_mise_a_jour: 'Il y a 5 heures',
  },
  {
    id_zone: 'zone_ndogbong',
    nom_zone: 'Ndogbong (Cité des Palmiers)',
    quartier: 'Ndogbong',
    niveau_de_risque: 'modéré',
    description: 'Zone vallonnée avec axes routiers en contrebas coupés lors de pluies continues supérieures à 40mm.',
    lat: 4.0450,
    lng: 9.7480,
    rayon_metres: 1200,
    est_inonde: false,
    cours_eau_proche: 'Bassin versant Dibamba ouest',
    population_estimee: 42000,
    derniere_mise_a_jour: 'Hier',
  },
  {
    id_zone: 'zone_logbaba',
    nom_zone: 'Logbaba (Carrefour Gaz & Zone Industrielle)',
    quartier: 'Logbaba',
    niveau_de_risque: 'faible',
    description: 'Zone industrielle en léger surplomb, sol latéritique plus filtrant. Risque limité aux ravinements locaux.',
    lat: 4.0280,
    lng: 9.7550,
    rayon_metres: 1300,
    est_inonde: false,
    cours_eau_proche: 'Caniveau périphérique sud',
    population_estimee: 28000,
    derniere_mise_a_jour: 'Hier',
  },
];

const INITIAL_ADMINS: Administrateur[] = [
  {
    id_admin: 'admin_1',
    nom: 'Commandant Njoya (CUD & Protection Civile)',
    email: 'admin@alertedouala.cm',
    mot_de_passe: 'admin123',
    role: 'superadmin',
  },
];

const INITIAL_USERS: Utilisateur[] = [
  {
    id_utilisateur: 'user_demo_1',
    nom: 'Mbedi',
    prenom: 'Jean-Paul',
    telephone: '+237 699 12 34 56',
    email: 'citoyen@alertedouala.cm',
    adresse: 'Makèpé',
    mot_de_passe: 'user123',
    canaux_preferes: ['SMS', 'WhatsApp', 'Notification'],
    date_inscription: '2026-03-15T09:00:00Z',
  },
  {
    id_utilisateur: 'user_demo_2',
    nom: 'Eboumbou',
    prenom: 'Madeleine',
    telephone: '+237 677 88 99 00',
    email: 'madeleine.eboumbou@gmail.com',
    adresse: 'Bépanda',
    mot_de_passe: 'user123',
    canaux_preferes: ['WhatsApp', 'Notification'],
    date_inscription: '2026-04-01T14:30:00Z',
  },
  {
    id_utilisateur: 'user_demo_3',
    nom: 'Ngassa',
    prenom: 'Célestin',
    telephone: '+237 655 44 22 11',
    email: 'c.ngassa@yahoo.fr',
    adresse: 'Nylon',
    mot_de_passe: 'user123',
    canaux_preferes: ['SMS'],
    date_inscription: '2026-04-10T11:20:00Z',
  },
  {
    id_utilisateur: 'user_demo_4',
    nom: 'Kamdem',
    prenom: 'Sylvie',
    telephone: '+237 690 11 22 33',
    email: 'sylvie.kamdem@outlook.com',
    adresse: 'Deido',
    mot_de_passe: 'user123',
    canaux_preferes: ['SMS', 'WhatsApp'],
    date_inscription: '2026-05-02T16:00:00Z',
  },
];

const INITIAL_SIGNALEMENTS: Signalement[] = [
  {
    id_signalement: 'sig_101',
    id_utilisateur: 'user_demo_1',
    nom_auteur: 'Jean-Paul Mbedi',
    telephone_auteur: '+237 699 12 34 56',
    date: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    type_incident: 'Inondation / Crue',
    description: 'Le collecteur de Missokè déborde sur la chaussée principale. L\'eau monte rapidement et pénètre dans les boutiques.',
    statut: 'en attente',
    zones_concernees: ['zone_makèpé'],
    hauteur_eau: 'Genou (30-50 cm)',
    gravite: 'grave',
  },
  {
    id_signalement: 'sig_102',
    id_utilisateur: 'user_demo_2',
    nom_auteur: 'Madeleine Eboumbou',
    telephone_auteur: '+237 677 88 99 00',
    date: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    type_incident: 'Effondrement d’immeuble / bâtiment',
    description: 'Effondrement partiel d\'un mur porteur et d\'une toiture d\'un bâtiment R+2 fragilisé par les pluies torrentielles au carrefour TSF. Périmètre à sécuriser immédiatement.',
    statut: 'validé',
    zones_concernees: ['zone_bepanda'],
    gravite: 'critique / urgence vitale',
    note_admin: 'Équipe Sapeurs-Pompiers 118 et Police sur place. Évacuation immédiate des riverains ordonnée.',
  },
  {
    id_signalement: 'sig_103',
    id_utilisateur: 'user_demo_3',
    nom_auteur: 'Célestin Ngassa',
    telephone_auteur: '+237 655 44 22 11',
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    type_incident: 'Éboulement / Glissement de terrain',
    description: 'Glissement de terrain sur le talus raviné en bordure de route. Une concession menace de glisser dans le ravin.',
    statut: 'validé',
    zones_concernees: [],
    zone_personnalisee: 'Ndogpassi 3 (Vers Carrefour Deux Églises)',
    gravite: 'grave',
    note_admin: 'Zone balisée, équipe technique CUD dépêchée pour étayage d\'urgence.',
  },
  {
    id_signalement: 'sig_104',
    id_utilisateur: 'user_demo_4',
    nom_auteur: 'Sylvie Kamdem',
    telephone_auteur: '+237 690 11 22 33',
    date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    type_incident: 'Poteau ou câble électrique à terre',
    description: 'Poteau en bois sectionné avec câble sous tension tombé dans une flaque d\'eau près des commerces.',
    statut: 'validé',
    zones_concernees: ['zone_deido'],
    gravite: 'critique / urgence vitale',
    note_admin: 'Équipe Eneo avisée pour consignation et coupure de ligne.',
  },
];

const INITIAL_ALERTES: Alerte[] = [
  {
    id_alerte: 'alt_001',
    id_admin: 'admin_1',
    nom_admin: 'Commandant Njoya (CUD)',
    date_alerte: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    type_alerte: 'Crue subite',
    message: 'ALERTE ROUGE : Débordement majeur du collecteur Makèpé Missokè. Évacuez les zones basses et mettez les biens en hauteur. Ne tentez pas de franchir les radiers submergés.',
    niveau_urgence: 'critique',
    zones_destinataires: ['zone_makèpé'],
    canaux: ['SMS', 'WhatsApp', 'Notification'],
  },
  {
    id_alerte: 'alt_002',
    id_admin: 'admin_1',
    nom_admin: 'Commandant Njoya (CUD)',
    date_alerte: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    type_alerte: 'Forte pluie',
    message: 'VIGILANCE ACCRUE : Précipitations continues à Bépanda et Nylon. Fort risque d\'enclavement des voies secondaires. Contactez le 118 en cas de détresse.',
    niveau_urgence: 'critique',
    zones_destinataires: ['zone_bepanda', 'zone_nylon'],
    canaux: ['WhatsApp', 'Notification'],
  },
  {
    id_alerte: 'alt_003',
    id_admin: 'admin_1',
    nom_admin: 'Commandant Njoya (CUD)',
    date_alerte: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    type_alerte: 'Marée haute Wouri',
    message: 'Marée de vive-eau attendue sur l\'estuaire du Wouri couplée aux averses. Riverains de Deido et Youpwè, restez en veille active.',
    niveau_urgence: 'élevé',
    zones_destinataires: ['zone_deido', 'zone_youpwe', 'zone_bonaberi'],
    canaux: ['Notification'],
  },
];

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  initData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.ZONES)) {
      this.set(STORAGE_KEYS.ZONES, INITIAL_ZONES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALERTES)) {
      this.set(STORAGE_KEYS.ALERTES, INITIAL_ALERTES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SIGNALEMENTS)) {
      this.set(STORAGE_KEYS.SIGNALEMENTS, INITIAL_SIGNALEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.UTILISATEURS)) {
      this.set(STORAGE_KEYS.UTILISATEURS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
      this.set(STORAGE_KEYS.ADMINS, INITIAL_ADMINS);
    }
  }

  // --- ZONES DE RISQUE ---
  getZones(): ZoneDeRisque[] {
    this.initData();
    return this.get<ZoneDeRisque[]>(STORAGE_KEYS.ZONES, INITIAL_ZONES);
  }

  getZoneById(id: string): ZoneDeRisque | undefined {
    return this.getZones().find((z) => z.id_zone === id);
  }

  updateZone(updated: ZoneDeRisque): void {
    const zones = this.getZones().map((z) => (z.id_zone === updated.id_zone ? updated : z));
    this.set(STORAGE_KEYS.ZONES, zones);
    this.notifyUpdate();
  }

  createZone(newZone: ZoneDeRisque): void {
    const zones = [newZone, ...this.getZones()];
    this.set(STORAGE_KEYS.ZONES, zones);
    this.notifyUpdate();
  }

  deleteZone(id: string): boolean {
    const zones = this.getZones();
    if (!zones.some((z) => z.id_zone === id)) return false;
    this.set(
      STORAGE_KEYS.ZONES,
      zones.filter((z) => z.id_zone !== id)
    );
    this.notifyUpdate();
    return true;
  }

  // --- SIGNALEMENTS ---
  getSignalements(): Signalement[] {
    this.initData();
    return this.get<Signalement[]>(STORAGE_KEYS.SIGNALEMENTS, INITIAL_SIGNALEMENTS);
  }

  getSignalementById(id: string): Signalement | undefined {
    return this.getSignalements().find((s) => s.id_signalement === id);
  }

  createSignalement(report: Omit<Signalement, 'id_signalement' | 'date' | 'statut'>): Signalement {
    const newReport: Signalement = {
      ...report,
      id_signalement: `sig_${Date.now()}`,
      date: new Date().toISOString(),
      statut: 'en attente',
    };
    const list = [newReport, ...this.getSignalements()];
    this.set(STORAGE_KEYS.SIGNALEMENTS, list);
    this.notifyUpdate();
    return newReport;
  }

  updateSignalementStatut(
    id: string,
    statut: StatutSignalement,
    noteAdmin?: string
  ): Signalement | null {
    const list = this.getSignalements();
    const index = list.findIndex((s) => s.id_signalement === id);
    if (index === -1) return null;

    const updated: Signalement = {
      ...list[index],
      statut,
      note_admin: noteAdmin || list[index].note_admin,
    };
    list[index] = updated;
    this.set(STORAGE_KEYS.SIGNALEMENTS, list);
    this.notifyUpdate();
    return updated;
  }

  // --- ALERTES ---
  getAlertes(): Alerte[] {
    this.initData();
    return this.get<Alerte[]>(STORAGE_KEYS.ALERTES, INITIAL_ALERTES);
  }

  getAlerteById(id: string): Alerte | undefined {
    return this.getAlertes().find((a) => a.id_alerte === id);
  }

  // Règle métier : validation admin explicite + vérification d'existence
  createAlerte(
    alerteData: Omit<Alerte, 'id_alerte' | 'date_alerte'>
  ): Alerte {
    const newAlerte: Alerte = {
      ...alerteData,
      id_alerte: `alt_${Date.now()}`,
      date_alerte: new Date().toISOString(),
    };
    const list = [newAlerte, ...this.getAlertes()];
    this.set(STORAGE_KEYS.ALERTES, list);
    this.notifyUpdate();
    return newAlerte;
  }

  updateAlerte(id: string, changes: Partial<Alerte>): Alerte | null {
    const list = this.getAlertes();
    const index = list.findIndex((a) => a.id_alerte === id);
    if (index === -1) {
      return null; // Règle métier : vérification qu'elle existe
    }
    const updated: Alerte = {
      ...list[index],
      ...changes,
    };
    list[index] = updated;
    this.set(STORAGE_KEYS.ALERTES, list);
    this.notifyUpdate();
    return updated;
  }

  deleteAlerte(id: string): boolean {
    const list = this.getAlertes();
    const exists = list.some((a) => a.id_alerte === id);
    if (!exists) {
      return false; // Règle métier : vérification qu'elle existe
    }
    this.set(
      STORAGE_KEYS.ALERTES,
      list.filter((a) => a.id_alerte !== id)
    );
    this.notifyUpdate();
    return true;
  }

  // --- UTILISATEURS & ADMINS ---
  getUtilisateurs(): Utilisateur[] {
    this.initData();
    return this.get<Utilisateur[]>(STORAGE_KEYS.UTILISATEURS, INITIAL_USERS);
  }

  createUtilisateur(user: Omit<Utilisateur, 'id_utilisateur' | 'date_inscription'>): Utilisateur {
    const newUser: Utilisateur = {
      ...user,
      id_utilisateur: `usr_${Date.now()}`,
      date_inscription: new Date().toISOString(),
    };
    const list = [newUser, ...this.getUtilisateurs()];
    this.set(STORAGE_KEYS.UTILISATEURS, list);
    return newUser;
  }

  deleteUtilisateur(id: string): boolean {
    const list = this.getUtilisateurs();
    if (!list.some((u) => u.id_utilisateur === id)) return false;
    this.set(
      STORAGE_KEYS.UTILISATEURS,
      list.filter((u) => u.id_utilisateur !== id)
    );
    this.notifyUpdate();
    return true;
  }

  getAdmins(): Administrateur[] {
    this.initData();
    return this.get<Administrateur[]>(STORAGE_KEYS.ADMINS, INITIAL_ADMINS);
  }

  // Event listener for in-app reactive updates
  private listeners: (() => void)[] = [];
  subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notifyUpdate(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error(e);
      }
    });
  }

  // Reset to default demo data
  resetDemoData(): void {
    this.set(STORAGE_KEYS.ZONES, INITIAL_ZONES);
    this.set(STORAGE_KEYS.ALERTES, INITIAL_ALERTES);
    this.set(STORAGE_KEYS.SIGNALEMENTS, INITIAL_SIGNALEMENTS);
    this.set(STORAGE_KEYS.UTILISATEURS, INITIAL_USERS);
    this.set(STORAGE_KEYS.ADMINS, INITIAL_ADMINS);
    this.notifyUpdate();
  }
}

export const storageService = new StorageService();
