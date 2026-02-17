import { HazardTask, AILabel } from "@/types/hazard";

const img = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop";

function makeLabel(primary: string, relevance: number, candidates: { label: string; relevance: number; reasoning: string }[]): AILabel {
  return {
    ai_label: primary,
    human_label: null,
    annotation_note: null,
    annotated_by: null,
    annotated_at: null,
    candidates,
    locked: false,
    auto_confirmed: false,
  };
}

function deadline(minutesFromNow: number): string {
  return new Date(Date.now() + minutesFromNow * 60000).toISOString();
}

const LOKASI_VALUES = ["Marine", "Office", "Workshop", "Warehouse"];
function pickLokasi(i: number) { return LOKASI_VALUES[i % LOKASI_VALUES.length]; }

export const mockHazards: HazardTask[] = [
  {
    id: "7316822", timestamp: "2025-09-18 08:14", pic_perusahaan: "PT Multi Ardecon", site: "BMO 2",
    lokasi: pickLokasi(0),
    detail_location: "Pembangunan ...", ketidaksesuaian: "Pembelian, ...", sub_ketidaksesuaian: "Penyimpanan bahan ...",
    description: "Kaleng Thiner ditemukan tanpa label di area penyimpanan bahan kimia.", image_url: img,
    tbc: makeLabel("1. Deviasi Prosedur", 82, [
      { label: "1. Deviasi Prosedur", relevance: 82, reasoning: "Detected missing procedure compliance and unsafe chemical storage." },
      { label: "6. Pengamanan", relevance: 65, reasoning: "Unlabeled chemicals pose security risk." },
      { label: "12. Bahaya Kebakaran", relevance: 48, reasoning: "Thinner is flammable material." },
    ]),
    pspp: makeLabel("1. Deviasi Prosedur", 78, [
      { label: "1. Deviasi Prosedur", relevance: 78, reasoning: "Non-compliance with labeling procedure." },
      { label: "2. Housekeeping", relevance: 60, reasoning: "Poor material organization detected." },
      { label: "6. Pengamanan", relevance: 45, reasoning: "Unsecured hazardous materials." },
    ]),
    gr: makeLabel("1. Deviasi Prosedur", 75, [
      { label: "1. Deviasi Prosedur", relevance: 75, reasoning: "Procedure deviation in storage area." },
      { label: "12. Bahaya Kebakaran", relevance: 55, reasoning: "Fire hazard from chemical storage." },
      { label: "2. Housekeeping", relevance: 40, reasoning: "Storage area not well organized." },
    ]),
    status: "ai_pending", reporter: "Ahmad S.", sla_deadline: deadline(3),
  },
  {
    id: "7316406", timestamp: "2025-09-18 07:52", pic_perusahaan: "PT Serasi ...", site: "BMO 1",
    lokasi: pickLokasi(1),
    detail_location: "Office Cokelat", ketidaksesuaian: "DDP : Kelayakan da...", sub_ketidaksesuaian: "Tidak menggunakan ...",
    description: "Wilnat kurang 1 unit pada area kerja welding tanpa proteksi memadai.", image_url: img,
    tbc: makeLabel("10. Tools Tidak Layak", 62, [
      { label: "10. Tools Tidak Layak", relevance: 62, reasoning: "Welding equipment missing proper tools." },
      { label: "4. Posisi Pekerja", relevance: 55, reasoning: "Worker positioned without adequate protection." },
      { label: "1. Deviasi Prosedur", relevance: 42, reasoning: "Procedure not followed for PPE." },
    ]),
    pspp: makeLabel("10. Tools Tidak Layak", 58, [
      { label: "10. Tools Tidak Layak", relevance: 58, reasoning: "Inadequate tooling in welding area." },
      { label: "4. Posisi Pekerja", relevance: 50, reasoning: "Worker exposure risk detected." },
      { label: "6. Pengamanan", relevance: 38, reasoning: "Safety barrier missing." },
    ]),
    gr: makeLabel("10. Tools Tidak Layak", 64, [
      { label: "10. Tools Tidak Layak", relevance: 64, reasoning: "Tool condition below standard." },
      { label: "1. Deviasi Prosedur", relevance: 48, reasoning: "Non-compliance with tool check procedure." },
      { label: "4. Posisi Pekerja", relevance: 35, reasoning: "Worker position risk." },
    ]),
    status: "ai_pending", reporter: "Budi R.", sla_deadline: deadline(45),
  },
  {
    id: "7316563", timestamp: "2025-09-18 07:41", pic_perusahaan: "PT Pamapersad...", site: "BMO 2",
    lokasi: pickLokasi(2),
    detail_location: "Bays Champions", ketidaksesuaian: "Kelayakan/Penggun...", sub_ketidaksesuaian: "Kesesuaian ...",
    description: "Ditemukan Lock out tag out tidak terpasang dengan benar pada panel listrik.", image_url: img,
    tbc: makeLabel("7. LOTO", 91, [
      { label: "7. LOTO", relevance: 91, reasoning: "LOTO device improperly installed on electrical panel." },
      { label: "11. Bahaya Elektrikal", relevance: 72, reasoning: "Electrical hazard from exposed panel." },
      { label: "1. Deviasi Prosedur", relevance: 55, reasoning: "Standard LOTO procedure not followed." },
    ]),
    pspp: makeLabel("7. LOTO", 88, [
      { label: "7. LOTO", relevance: 88, reasoning: "LOTO compliance failure detected." },
      { label: "11. Bahaya Elektrikal", relevance: 68, reasoning: "Risk of electrocution." },
      { label: "6. Pengamanan", relevance: 45, reasoning: "Safety lock missing." },
    ]),
    gr: makeLabel("7. LOTO", 85, [
      { label: "7. LOTO", relevance: 85, reasoning: "LOTO non-compliance confirmed." },
      { label: "11. Bahaya Elektrikal", relevance: 65, reasoning: "Electrical safety risk." },
      { label: "1. Deviasi Prosedur", relevance: 50, reasoning: "Procedure deviation." },
    ]),
    status: "ai_pending", reporter: "Cahya M.", sla_deadline: deadline(95),
  },
  {
    id: "7316441", timestamp: "2025-09-18 07:33", pic_perusahaan: "PT Berau Coal", site: "BMO 2",
    lokasi: pickLokasi(3),
    detail_location: "Gudang Handa...", ketidaksesuaian: "Pengelolaan Sampah", sub_ketidaksesuaian: "[ENV] Sampah ...",
    description: "Sampah bertumpuk di area gudang tanpa penanganan sesuai SOP.", image_url: img,
    tbc: makeLabel("2. Housekeeping", 68, [
      { label: "2. Housekeeping", relevance: 68, reasoning: "Waste accumulation detected in storage." },
      { label: "1. Deviasi Prosedur", relevance: 55, reasoning: "SOP for waste management not followed." },
      { label: "4. Posisi Pekerja", relevance: 30, reasoning: "Worker access blocked by waste." },
    ]),
    pspp: makeLabel("2. Housekeeping", 65, [
      { label: "2. Housekeeping", relevance: 65, reasoning: "Poor housekeeping in warehouse." },
      { label: "1. Deviasi Prosedur", relevance: 52, reasoning: "Waste disposal procedure violation." },
      { label: "6. Pengamanan", relevance: 35, reasoning: "Security risk from clutter." },
    ]),
    gr: makeLabel("2. Housekeeping", 60, [
      { label: "2. Housekeeping", relevance: 60, reasoning: "Housekeeping standards not met." },
      { label: "1. Deviasi Prosedur", relevance: 48, reasoning: "Environmental procedure deviation." },
      { label: "12. Bahaya Kebakaran", relevance: 32, reasoning: "Fire risk from accumulated waste." },
    ]),
    status: "ai_pending", reporter: "Dian P.", sla_deadline: deadline(8),
  },
  {
    id: "7316163", timestamp: "2025-09-18 07:20", pic_perusahaan: "PT Arcistec ...", site: "BMO 2",
    lokasi: pickLokasi(0),
    detail_location: "Sump/void", ketidaksesuaian: "Perlengkapan_Mesi...", sub_ketidaksesuaian: "Pelepasan komponen...",
    description: "Box battery tidak terpasang cover, kabel terbuka dan berpotensi short circuit.", image_url: img,
    tbc: makeLabel("11. Bahaya Elektrikal", 87, [
      { label: "11. Bahaya Elektrikal", relevance: 87, reasoning: "Exposed electrical cables with short circuit risk." },
      { label: "10. Tools Tidak Layak", relevance: 62, reasoning: "Battery box cover missing." },
      { label: "1. Deviasi Prosedur", relevance: 45, reasoning: "Maintenance procedure not followed." },
    ]),
    pspp: makeLabel("11. Bahaya Elektrikal", 84, [
      { label: "11. Bahaya Elektrikal", relevance: 84, reasoning: "Electrical hazard from exposed cables." },
      { label: "10. Tools Tidak Layak", relevance: 58, reasoning: "Equipment condition below standard." },
      { label: "6. Pengamanan", relevance: 40, reasoning: "Safety cover missing." },
    ]),
    gr: makeLabel("11. Bahaya Elektrikal", 80, [
      { label: "11. Bahaya Elektrikal", relevance: 80, reasoning: "High voltage exposure risk." },
      { label: "10. Tools Tidak Layak", relevance: 55, reasoning: "Tool/equipment integrity issue." },
      { label: "1. Deviasi Prosedur", relevance: 42, reasoning: "Maintenance checklist deviation." },
    ]),
    status: "ai_pending", reporter: "Eko W.", sla_deadline: deadline(72),
  },
  {
    id: "7316601", timestamp: "2025-09-18 07:11", pic_perusahaan: "PT Berau Coal", site: "LMO",
    lokasi: pickLokasi(1),
    detail_location: "Akses Masuk ...", ketidaksesuaian: "Kelengkapan tangg...", sub_ketidaksesuaian: "Alat Tanggap Darura...",
    description: "P2h unit dan alat tanggap darurat tidak lengkap di area loading.", image_url: img,
    tbc: makeLabel("15. Deviasi Lainnya", 55, [
      { label: "15. Deviasi Lainnya", relevance: 55, reasoning: "Emergency equipment not complete." },
      { label: "6. Pengamanan", relevance: 50, reasoning: "Safety preparedness issue." },
      { label: "1. Deviasi Prosedur", relevance: 45, reasoning: "P2H checklist not completed." },
    ]),
    pspp: makeLabel("15. Deviasi Lainnya", 52, [
      { label: "15. Deviasi Lainnya", relevance: 52, reasoning: "Non-standard emergency response." },
      { label: "6. Pengamanan", relevance: 48, reasoning: "Security gap in loading area." },
      { label: "1. Deviasi Prosedur", relevance: 40, reasoning: "Pre-operation check deviation." },
    ]),
    gr: makeLabel("15. Deviasi Lainnya", 50, [
      { label: "15. Deviasi Lainnya", relevance: 50, reasoning: "General deviation in emergency prep." },
      { label: "6. Pengamanan", relevance: 46, reasoning: "Emergency equipment gap." },
      { label: "1. Deviasi Prosedur", relevance: 38, reasoning: "Procedure compliance gap." },
    ]),
    status: "ai_pending", reporter: "Faisal K.", sla_deadline: deadline(25),
  },
  {
    id: "7315941", timestamp: "2025-09-18 06:55", pic_perusahaan: "PT Bukit Makmu...", site: "LMO",
    lokasi: pickLokasi(2),
    detail_location: "Area ...", ketidaksesuaian: "Perlengkapan_Mesi...", sub_ketidaksesuaian: "Penyesuaian/ ...",
    description: "Di temukan tyre aus melebihi batas pada unit HD785.", image_url: img,
    tbc: makeLabel("10. Tools Tidak Layak", 76, [
      { label: "10. Tools Tidak Layak", relevance: 76, reasoning: "Tyre wear beyond safe limits." },
      { label: "1. Deviasi Prosedur", relevance: 58, reasoning: "Maintenance schedule not followed." },
      { label: "8. Deviasi Road Safety", relevance: 52, reasoning: "Road safety risk from worn tyre." },
    ]),
    pspp: makeLabel("10. Tools Tidak Layak", 73, [
      { label: "10. Tools Tidak Layak", relevance: 73, reasoning: "Equipment fitness issue." },
      { label: "1. Deviasi Prosedur", relevance: 55, reasoning: "Inspection procedure gap." },
      { label: "8. Deviasi Road Safety", relevance: 48, reasoning: "Haul road safety concern." },
    ]),
    gr: makeLabel("10. Tools Tidak Layak", 70, [
      { label: "10. Tools Tidak Layak", relevance: 70, reasoning: "Heavy equipment tyre degradation." },
      { label: "8. Deviasi Road Safety", relevance: 52, reasoning: "Road safety risk." },
      { label: "1. Deviasi Prosedur", relevance: 45, reasoning: "Maintenance deviation." },
    ]),
    status: "ai_pending", reporter: "Gunawan T.", sla_deadline: deadline(110),
  },
  {
    id: "7316617", timestamp: "2025-09-18 06:40", pic_perusahaan: "PT Kaltim ...", site: "BMO 1",
    lokasi: pickLokasi(3),
    detail_location: "Red Zone Jalan ...", ketidaksesuaian: "Standar Road ...", sub_ketidaksesuaian: "Drainase tersumbat ...",
    description: "Windrow tersumbat material longsor, akses jalan hauling terganggu.", image_url: img,
    tbc: makeLabel("8. Deviasi Road Safety", 90, [
      { label: "8. Deviasi Road Safety", relevance: 90, reasoning: "Blocked windrow creating haul road hazard." },
      { label: "3. Geotech & Geologi", relevance: 68, reasoning: "Landslide material detected." },
      { label: "1. Deviasi Prosedur", relevance: 45, reasoning: "Road maintenance procedure gap." },
    ]),
    pspp: makeLabel("8. Deviasi Road Safety", 87, [
      { label: "8. Deviasi Road Safety", relevance: 87, reasoning: "Road safety standard deviation." },
      { label: "3. Geotech & Geologi", relevance: 65, reasoning: "Geological instability risk." },
      { label: "2. Housekeeping", relevance: 40, reasoning: "Road area not maintained." },
    ]),
    gr: makeLabel("8. Deviasi Road Safety", 85, [
      { label: "8. Deviasi Road Safety", relevance: 85, reasoning: "Haul road safety compromised." },
      { label: "3. Geotech & Geologi", relevance: 62, reasoning: "Geotechnical issue contributing to blockage." },
      { label: "1. Deviasi Prosedur", relevance: 42, reasoning: "Standard deviation in road maintenance." },
    ]),
    status: "ai_pending", reporter: "Hendra L.", sla_deadline: deadline(55),
  },
  {
    id: "7315805", timestamp: "2025-09-18 06:30", pic_perusahaan: "PT Bukit Makmu...", site: "BMO 2",
    lokasi: pickLokasi(0),
    detail_location: "(B7) Jl. Lavender", ketidaksesuaian: "Perawatan Jalan", sub_ketidaksesuaian: "Boulder",
    description: "Terdapat tumpahan material di jalan hauling tanpa warning sign.", image_url: img,
    tbc: makeLabel("9. Kesesuaian", 72, [
      { label: "9. Kesesuaian", relevance: 72, reasoning: "Material spillage without proper signage." },
      { label: "8. Deviasi Road Safety", relevance: 66, reasoning: "Road safety risk from spilled material." },
      { label: "2. Housekeeping", relevance: 48, reasoning: "Road area not cleaned properly." },
    ]),
    pspp: makeLabel("9. Kesesuaian", 69, [
      { label: "9. Kesesuaian", relevance: 69, reasoning: "Compliance gap in road maintenance." },
      { label: "8. Deviasi Road Safety", relevance: 62, reasoning: "Hauling road hazard detected." },
      { label: "6. Pengamanan", relevance: 42, reasoning: "Missing warning signs." },
    ]),
    gr: makeLabel("9. Kesesuaian", 66, [
      { label: "9. Kesesuaian", relevance: 66, reasoning: "Non-conformance with road standards." },
      { label: "8. Deviasi Road Safety", relevance: 60, reasoning: "Road safety deviation." },
      { label: "2. Housekeeping", relevance: 45, reasoning: "Road cleanliness not maintained." },
    ]),
    status: "ai_pending", reporter: "Irfan A.", sla_deadline: deadline(15),
  },
  {
    id: "7316608", timestamp: "2025-09-18 06:15", pic_perusahaan: "PT Multi Ardecon", site: "MARINE",
    lokasi: pickLokasi(1),
    detail_location: "INTAN MEGAH ...", ketidaksesuaian: "Bahaya Eletrikal", sub_ketidaksesuaian: "Pengamanan ...",
    description: "Kabel belum di rapikan dan berpotensi tersandung di area workshop.", image_url: img,
    tbc: makeLabel("11. Bahaya Elektrikal", 78, [
      { label: "11. Bahaya Elektrikal", relevance: 78, reasoning: "Exposed cables creating trip and electrical hazard." },
      { label: "2. Housekeeping", relevance: 65, reasoning: "Cable management issue in workshop." },
      { label: "6. Pengamanan", relevance: 50, reasoning: "Safety hazard from loose cables." },
    ]),
    pspp: makeLabel("11. Bahaya Elektrikal", 74, [
      { label: "11. Bahaya Elektrikal", relevance: 74, reasoning: "Electrical cable safety risk." },
      { label: "2. Housekeeping", relevance: 62, reasoning: "Workshop area not organized." },
      { label: "6. Pengamanan", relevance: 48, reasoning: "Trip hazard from cables." },
    ]),
    gr: makeLabel("11. Bahaya Elektrikal", 71, [
      { label: "11. Bahaya Elektrikal", relevance: 71, reasoning: "Electrical hazard in workshop area." },
      { label: "2. Housekeeping", relevance: 58, reasoning: "Cable housekeeping issue." },
      { label: "6. Pengamanan", relevance: 44, reasoning: "Physical safety risk." },
    ]),
    status: "ai_pending", reporter: "Joko S.", sla_deadline: deadline(35),
  },
];
