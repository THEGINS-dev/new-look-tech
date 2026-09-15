import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
     
      {/* GRILLE 4 COLONNES */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
       
        {/* COLONNE 1 : Logo + Vision */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image src="/images/Logo.jpg" alt="Logo NEW LOOK TECH" width={44} height={44} className="rounded-xl object-cover" />
            <h2 className="font-orbitron text-lg font-bold text-white leading-tight">
              NEW <span className="text-spark-orange">LOOK</span><br />TECH
            </h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            L'excellence technique au point moderne, au service de vos ambitions. Soudure, construction, électricité et maintenance de classe en RDC.
          </p>
        </div>

        {/* COLONNE 2 : Navigation */}
        <div>
                  {/* COLONNE 2 : Navigation */}
        <div>
          <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider mb-4">Navigation</h3>
          <ul className="space-y-3">
            <li><a href="/#accueil" className="text-gray-400 hover:text-spark-orange transition-colors text-sm">Accueil</a></li>
            <li><a href="/#services" className="text-gray-400 hover:text-spark-orange transition-colors text-sm">Nos Expertises</a></li>
            <li><a href="/#realisations" className="text-gray-400 hover:text-spark-orange transition-colors text-sm">Réalisations</a></li>
            <li><a href="/blog" className="text-gray-400 hover:text-spark-orange transition-colors text-sm">Blog</a></li>
            <li><a href="/#contact" className="text-gray-400 hover:text-spark-orange transition-colors text-sm">Contact & Devis</a></li>
          </ul>
        </div>

        {/* COLONNE 3 : Les 6 Expertises complètes */}
        <div>
          <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider mb-4">Services</h3>
          <ul className="space-y-3">
            <li><a href="#services" className="text-gray-400 hover:text-cyan-electric transition-colors text-sm">Soudure & Ferronnerie</a></li>
            <li><a href="#services" className="text-gray-400 hover:text-cyan-electric transition-colors text-sm">Construction & Génie Civil</a></li>
            <li><a href="#services" className="text-gray-400 hover:text-cyan-electric transition-colors text-sm">Installation Électrique</a></li>
            <li><a href="#services" className="text-gray-400 hover:text-cyan-electric transition-colors text-sm">Peinture & Traitement</a></li>
            <li><a href="#services" className="text-gray-400 hover:text-cyan-electric transition-colors text-sm">Plafonds Modernes</a></li>
            <li><a href="#services" className="text-gray-400 hover:text-cyan-electric transition-colors text-sm">Maintenance & Ingénierie</a></li>
          </ul>
        </div>

        {/* COLONNE 4 : Contact (tous cliquables) */}
        <div>
          <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h3>
          <ul className="space-y-4">
            <li>
              <a href="https://www.google.com/maps/search/?api=1&query=Megastore+Lubumbashi+RDC" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-spark-orange mt-0.5 shrink-0" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">Megastore, Av. Kafubu, Lubumbashi, RDC</span>
              </a>
            </li>
            <li>
              <a href="tel:+243972083066" className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-spark-orange shrink-0" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">+243 972 083 066</span>
              </a>
            </li>
            <li>
              <a href="mailto:newlooktechservice@gmail.com" className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-spark-orange shrink-0" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm break-all">newlooktechservice@gmail.com</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* BARRE INFÉRIEURE — pb-[88px] = pile la hauteur du bouton chatbot, zéro gaspillage */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-[88px] md:pb-8 flex flex-col sm:flex-row justify-between items-center gap-5">
         
          {/* Copyright à GAUCHE */}
          <p className="text-gray-500 text-xs text-center sm:text-left">
            © 2026 New Look Tech Service. Tous droits réservés. Conçu pour l'excellence.
          </p>

          {/* Logos à DROITE */}
          <div className="flex items-center space-x-6">
            {/* Facebook */}
            <a href="https://facebook.com/profile.php?id=61594125400628" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
               className="text-gray-500 hover:text-blue-500 hover:scale-110 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* WhatsApp Direct */}
            <a href="https://wa.me/243972083066" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
               className="text-gray-500 hover:text-green-500 hover:scale-110 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>

            {/* Chaîne WhatsApp — contour + badge diffusion orange */}
            <a href="https://whatsapp.com/channel/0029VbCCZD46mYPDoHqiUI2T" target="_blank" rel="noopener noreferrer"
               aria-label="Chaîne WhatsApp" title="Chaîne WhatsApp"
               className="relative text-gray-500 hover:text-teal-400 hover:scale-110 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-spark-orange border border-black"></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
