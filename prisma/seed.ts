const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Voyagr database...')

  // Clear existing data
  await prisma.seasonalityNote.deleteMany()
  await prisma.tripCollectionItem.deleteMany()
  await prisma.templateDay.deleteMany()
  await prisma.clientPortalPage.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.tripVersion.deleteMany()
  await prisma.generatedTravelerSummary.deleteMany()
  await prisma.leadNote.deleteMany()
  await prisma.tripSurvey.deleteMany()
  await prisma.customerLead.deleteMany()
  await prisma.itineraryTemplate.deleteMany()
  await prisma.pastTrip.deleteMany()
  await prisma.tripCollection.deleteMany()
  await prisma.destinationKnowledgeEntry.deleteMany()
  await prisma.savedPlace.deleteMany()
  await prisma.pricingEstimate.deleteMany()
  await prisma.emailTemplate.deleteMany()
  await prisma.businessSetting.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data')

  // ==================== ADMIN USER ====================
  const hashedPassword = await bcrypt.hash('voyagr2024', 12)
  await prisma.user.create({
    data: {
      email: 'admin@voyagr.com',
      name: 'Alexandra Rivera',
      role: 'ADMIN',
      password: hashedPassword,
      bio: 'Founder & Lead Travel Advisor at Voyagr. 15 years of curating personalized luxury travel experiences across Europe, Asia, and beyond.',
    },
  })
  console.log('Created admin user')

  // ==================== BUSINESS SETTINGS ====================
  const settings = [
    { key: 'business_name', value: 'Voyagr Travel', type: 'string', label: 'Business Name', group: 'general' },
    { key: 'advisor_name', value: 'Alexandra Rivera', type: 'string', label: 'Primary Advisor Name', group: 'general' },
    { key: 'contact_email', value: 'hello@voyagr.com', type: 'string', label: 'Contact Email', group: 'general' },
    { key: 'contact_phone', value: '+1 (800) 555-1234', type: 'string', label: 'Contact Phone', group: 'general' },
    { key: 'tagline', value: 'Tailored travel, built around the traveler.', type: 'string', label: 'Business Tagline', group: 'branding' },
    { key: 'primary_color', value: '#1e3a5f', type: 'string', label: 'Primary Brand Color', group: 'branding' },
    { key: 'accent_color', value: '#c9a84c', type: 'string', label: 'Accent / Gold Color', group: 'branding' },
    { key: 'proposal_footer', value: 'This proposal was prepared exclusively for you by Voyagr Travel. All pricing is estimated and subject to availability.', type: 'string', label: 'Default Proposal Footer', group: 'branding' },
    { key: 'email_signature', value: 'Warm regards,\nAlexandra Rivera\nVoyagr Travel\nhello@voyagr.com', type: 'string', label: 'Email Signature', group: 'email' },
    { key: 'auto_summary', value: 'true', type: 'boolean', label: 'Auto-generate Traveler Summary', description: 'Automatically generate AI traveler summary when survey is submitted', group: 'notifications' },
    { key: 'notify_new_lead', value: 'true', type: 'boolean', label: 'New Lead Notifications', description: 'Receive notification when a new survey is submitted', group: 'notifications' },
    { key: 'planning_fee_min', value: '500', type: 'number', label: 'Minimum Planning Fee ($)', group: 'general' },
    { key: 'planning_fee_max', value: '1500', type: 'number', label: 'Maximum Planning Fee ($)', group: 'general' },
  ]
  for (const s of settings) {
    await prisma.businessSetting.create({ data: s })
  }
  console.log('Created business settings')

  // ==================== EMAIL TEMPLATES ====================
  const emailTemplates = [
    {
      name: 'Welcome - New Inquiry',
      subject: 'Welcome to Voyagr, {{first_name}}!',
      category: 'welcome',
      bodyHtml: '<h2>Hello {{first_name}},</h2><p>Thank you for sharing your travel preferences with us. We\'re excited to start designing your perfect trip.</p><p>Your dedicated advisor will be reviewing your traveler profile and reaching out within 24 hours to schedule a planning call.</p><p>In the meantime, if anything comes to mind that you\'d like to add to your profile, simply reply to this email.</p><p>We can\'t wait to get started.</p><p>Warm regards,<br>{{advisor_name}}<br>Voyagr Travel</p>',
      bodyText: 'Hello {{first_name}},\n\nThank you for sharing your travel preferences with us. We\'re excited to start designing your perfect trip.\n\nYour dedicated advisor will be reviewing your traveler profile and reaching out within 24 hours.\n\nWarm regards,\n{{advisor_name}}\nVoyagr Travel',
      variables: JSON.stringify(['{{first_name}}', '{{advisor_name}}']),
      isDefault: true,
    },
    {
      name: 'Follow Up - Reviewing Your Trip',
      subject: 'We\'re working on your trip, {{first_name}}',
      category: 'followup',
      bodyHtml: '<h2>Hi {{first_name}},</h2><p>Just a quick note to let you know your trip is actively being designed. I\'ve been reviewing your preferences and I have some exciting ideas for {{destination}}.</p><p>I\'ll have a preliminary itinerary ready for you by {{date}}. In the meantime, feel free to reach out with any questions.</p><p>Best,<br>{{advisor_name}}</p>',
      bodyText: 'Hi {{first_name}},\n\nJust a quick note — your trip is actively being designed. I\'ve been reviewing your preferences and have exciting ideas for {{destination}}.\n\nI\'ll have a preliminary itinerary ready by {{date}}.\n\nBest,\n{{advisor_name}}',
      variables: JSON.stringify(['{{first_name}}', '{{advisor_name}}', '{{destination}}', '{{date}}']),
      isDefault: true,
    },
    {
      name: 'Proposal Ready',
      subject: 'Your {{destination}} proposal is ready, {{first_name}}!',
      category: 'proposal',
      bodyHtml: '<h2>{{first_name}}, your trip proposal is ready!</h2><p>I\'m thrilled to share your personalized {{destination}} itinerary. I\'ve put together something I think you\'re going to love.</p><p><strong>{{proposal_title}}</strong></p><p>You can view your complete trip plan here: [Portal Link]</p><p>Take your time reviewing it, and let me know when you\'d like to chat about it. We can adjust anything — this is your trip.</p><p>Excited for you,<br>{{advisor_name}}</p>',
      bodyText: 'Your trip proposal is ready, {{first_name}}!\n\nI\'m thrilled to share your personalized {{destination}} itinerary: {{proposal_title}}\n\nTake your time reviewing and let me know when you\'d like to discuss.\n\nExcited for you,\n{{advisor_name}}',
      variables: JSON.stringify(['{{first_name}}', '{{advisor_name}}', '{{destination}}', '{{proposal_title}}']),
      isDefault: true,
    },
    {
      name: 'Booking Confirmation',
      subject: 'It\'s official — your {{destination}} trip is booked!',
      category: 'booking',
      bodyHtml: '<h2>Congratulations, {{first_name}}!</h2><p>Your {{destination}} trip is officially booked. Everything is confirmed and we\'ll be managing all the details from here.</p><p>Here\'s what happens next:</p><ul><li>You\'ll receive a detailed trip document within 48 hours</li><li>All confirmations will be compiled into one easy-to-access portal</li><li>Your advisor is available 24/7 during your trip</li></ul><p>Start packing — this is going to be incredible.</p><p>{{advisor_name}}<br>Voyagr Travel</p>',
      bodyText: 'Congratulations, {{first_name}}! Your {{destination}} trip is booked.\n\nNext steps:\n- Trip document within 48 hours\n- All confirmations in your portal\n- 24/7 advisor support during your trip\n\nStart packing!\n{{advisor_name}}',
      variables: JSON.stringify(['{{first_name}}', '{{advisor_name}}', '{{destination}}']),
      isDefault: true,
    },
    {
      name: 'Check In',
      subject: 'Checking in on your trip plans, {{first_name}}',
      category: 'checkin',
      bodyHtml: '<h2>Hi {{first_name}},</h2><p>I wanted to check in and see how you\'re feeling about your upcoming {{destination}} trip. Is there anything you\'d like to add, adjust, or explore further?</p><p>Sometimes the best additions come from last-minute inspiration. Don\'t hesitate to reach out.</p><p>Looking forward to hearing from you,<br>{{advisor_name}}</p>',
      bodyText: 'Hi {{first_name}},\n\nChecking in on your {{destination}} trip plans. Anything you\'d like to add or adjust?\n\nLooking forward to hearing from you,\n{{advisor_name}}',
      variables: JSON.stringify(['{{first_name}}', '{{advisor_name}}', '{{destination}}']),
      isDefault: true,
    },
    {
      name: 'Thank You - Post Trip',
      subject: 'Welcome home, {{first_name}}! How was {{destination}}?',
      category: 'thankyou',
      bodyHtml: '<h2>Welcome back, {{first_name}}!</h2><p>I hope your {{destination}} trip was everything you dreamed of (and more). I\'d love to hear about your favorite moments.</p><p>If you have a minute, a brief review would mean the world to us. And if you\'re already thinking about your next adventure... we\'re here when you\'re ready.</p><p>Until next time,<br>{{advisor_name}}<br>Voyagr Travel</p>',
      bodyText: 'Welcome back, {{first_name}}!\n\nI hope {{destination}} was incredible. I\'d love to hear about your highlights.\n\nUntil next time,\n{{advisor_name}}',
      variables: JSON.stringify(['{{first_name}}', '{{advisor_name}}', '{{destination}}']),
      isDefault: true,
    },
  ]
  for (const t of emailTemplates) {
    await prisma.emailTemplate.create({ data: t })
  }
  console.log('Created email templates')

  // ==================== ITINERARY TEMPLATES ====================
  const templates = []

  // Template 1: Iceland Highlights
  const t1 = await prisma.itineraryTemplate.create({
    data: {
      title: 'Iceland Ring Road Adventure',
      destination: 'Iceland',
      country: 'Iceland',
      region: 'Nordic',
      flagEmoji: '🇮🇸',
      summary: 'An 8-day journey around Iceland\'s Ring Road, combining dramatic landscapes, natural hot springs, glacier hikes, and the magic of the northern lights.',
      description: 'This signature Iceland itinerary takes you on a complete loop of the island, hitting the highlights while maintaining a comfortable pace. From Reykjavik\'s creative energy to the otherworldly beauty of Jokulsarlon glacier lagoon, every day brings a new landscape. We include private transfers, curated accommodations, and insider access to hot springs and hidden waterfalls that most tourists miss.',
      durationDays: 8,
      travelStyles: JSON.stringify(['ADVENTURE', 'SCENIC', 'WELLNESS']),
      travelerTypes: JSON.stringify(['COUPLE', 'SOLO', 'GROUP_FRIENDS']),
      budgetLevel: 'TEN_TO_20K',
      paceLevel: 'moderate',
      tags: JSON.stringify(['signature', 'bestseller', 'adventure', 'nature']),
      status: 'ACTIVE',
      isFeatured: true,
      isBestSeller: true,
      isSignature: true,
      bestMonths: JSON.stringify([6, 7, 8, 9, 2, 3]),
      highlights: JSON.stringify(['Golden Circle private tour', 'Glacier hiking on Solheimajokull', 'Blue Lagoon retreat', 'Northern lights hunting (winter)', 'Diamond Beach at sunset', 'Whale watching from Husavik', 'Secret hot springs']),
      includes: JSON.stringify(['All accommodations', 'Private 4x4 vehicle with driver/guide', 'Blue Lagoon premium entry', 'Glacier hike with certified guide', 'Northern lights tour (seasonal)', 'Daily breakfast', 'Airport transfers']),
      excludes: JSON.stringify(['International flights', 'Travel insurance', 'Lunches and dinners (except noted)', 'Personal expenses']),
      basePrice: 8500,
      priceNotes: 'Per person based on double occupancy. Winter dates may vary.',
    },
  })
  templates.push(t1)
  // Days for Iceland
  const icelandDays = [
    { dayNumber: 1, title: 'Arrival in Reykjavik', location: 'Reykjavik', description: 'Arrive at Keflavik Airport. Private transfer to your boutique hotel in downtown Reykjavik. Evening at leisure to explore Laugavegur street.', activities: JSON.stringify(['Airport pickup', 'Hotel check-in', 'Reykjavik walking orientation']), meals: JSON.stringify(['Dinner at Grillid']), accommodation: 'Hotel Borg or similar', tips: 'Jet lag tip: take a walk along the harbor at sunset.' },
    { dayNumber: 2, title: 'Golden Circle', location: 'Golden Circle', description: 'Full day exploring Thingvellir National Park, Geysir geothermal area, and Gullfoss waterfall. End with a soak at Secret Lagoon.', activities: JSON.stringify(['Thingvellir National Park', 'Strokkur geyser', 'Gullfoss waterfall', 'Secret Lagoon']), meals: JSON.stringify(['Lunch at Fridheimar tomato farm']), accommodation: 'Hotel Ranga', tips: 'The Secret Lagoon is far less crowded than Blue Lagoon.' },
    { dayNumber: 3, title: 'South Coast Waterfalls', location: 'South Coast', description: 'Drive the stunning south coast past Seljalandsfoss and Skogafoss waterfalls. Visit the black sand beach at Vik.', activities: JSON.stringify(['Seljalandsfoss walk-behind', 'Skogafoss waterfall', 'Reynisfjara black sand beach', 'Vik village']), accommodation: 'Hotel Vik i Myrdal' },
    { dayNumber: 4, title: 'Glacier Adventure', location: 'Vatnajokull', description: 'Morning glacier hike on Solheimajokull. Afternoon drive to Jokulsarlon glacier lagoon and Diamond Beach.', activities: JSON.stringify(['Glacier hike with guide', 'Jokulsarlon boat tour', 'Diamond Beach sunset']), accommodation: 'Fosshotel Glacier Lagoon' },
    { dayNumber: 5, title: 'East Fjords', location: 'East Iceland', description: 'Explore the dramatic East Fjords. Visit charming fishing villages and enjoy panoramic mountain views.', activities: JSON.stringify(['East Fjords scenic drive', 'Seydisfjordur village', 'Local fish lunch', 'Photography stops']), accommodation: 'Hotel & Farm Egilsstadir' },
    { dayNumber: 6, title: 'Husavik & North', location: 'North Iceland', description: 'Drive to Husavik for whale watching. Visit Godafoss waterfall and Lake Myvatn area.', activities: JSON.stringify(['Whale watching tour', 'Godafoss waterfall', 'Myvatn Nature Baths', 'Hverir geothermal area']), accommodation: 'Fosshotel Myvatn' },
    { dayNumber: 7, title: 'Snaefellsnes Peninsula', location: 'West Iceland', description: 'Drive to Snaefellsnes, often called "Iceland in Miniature." Visit Kirkjufell mountain and Arnarstapi cliffs.', activities: JSON.stringify(['Kirkjufell mountain', 'Arnarstapi coastal walk', 'Budir black church', 'Snaefellsjokull views']), accommodation: 'Hotel Budir' },
    { dayNumber: 8, title: 'Blue Lagoon & Departure', location: 'Reykjavik', description: 'Morning at the Blue Lagoon Retreat Spa. Transfer to Keflavik Airport for departure.', activities: JSON.stringify(['Blue Lagoon premium experience', 'Airport transfer']), meals: JSON.stringify(['Blue Lagoon in-water bar']), accommodation: 'Departure' },
  ]
  for (const d of icelandDays) {
    await prisma.templateDay.create({ data: { ...d, templateId: t1.id } })
  }

  // Template 2: Paris + Provence
  const t2 = await prisma.itineraryTemplate.create({
    data: {
      title: 'Paris & Provence Slow Luxury',
      destination: 'Paris & Provence',
      country: 'France',
      region: 'Western Europe',
      flagEmoji: '🇫🇷',
      summary: 'A 10-day journey blending Parisian elegance with the sun-drenched beauty of Provence. Art, wine, cuisine, and lavender fields.',
      description: 'Begin in Paris with private museum tours, Michelin-starred dining, and hidden neighborhood exploration. Then take the TGV south to Provence for a completely different rhythm — vineyard visits, village markets, Roman ruins, and golden-hour meals under plane trees. This trip is designed for travelers who want depth over breadth.',
      durationDays: 10,
      travelStyles: JSON.stringify(['LUXURY', 'CULTURAL', 'FOODIE', 'ROMANTIC']),
      travelerTypes: JSON.stringify(['COUPLE', 'HONEYMOON', 'ANNIVERSARY']),
      budgetLevel: 'TEN_TO_20K',
      paceLevel: 'slow',
      tags: JSON.stringify(['signature', 'bestseller', 'romantic', 'foodie']),
      status: 'ACTIVE',
      isFeatured: true,
      isBestSeller: true,
      isSignature: true,
      bestMonths: JSON.stringify([5, 6, 7, 9, 10]),
      highlights: JSON.stringify(['Private Louvre tour before crowds', 'Michelin-starred dining', 'TGV to Provence', 'Lavender field visits (seasonal)', 'Wine tasting in Chateauneuf-du-Pape', 'Cooking class in Aix-en-Provence', 'Pont du Gard Roman aqueduct']),
      includes: JSON.stringify(['All accommodations', 'Private guided tours', 'TGV first-class tickets', 'Private driver in Provence', 'Cooking class', 'Wine tastings', 'Daily breakfast', 'Airport transfers']),
      excludes: JSON.stringify(['International flights', 'Travel insurance', 'Most dinners', 'Personal expenses']),
      basePrice: 12000,
      priceNotes: 'Per person. Lavender season (June-July) premium applies.',
    },
  })
  templates.push(t2)
  const parisDays = [
    { dayNumber: 1, title: 'Arrival in Paris', location: 'Paris', description: 'Welcome to Paris. Private transfer to your Left Bank boutique hotel. Evening stroll along the Seine.', activities: JSON.stringify(['Airport transfer', 'Hotel check-in', 'Seine evening walk']), accommodation: 'Hotel Verneuil or Le Pavillon de la Reine' },
    { dayNumber: 2, title: 'Art & Culture', location: 'Paris', description: 'Morning private tour of the Louvre (before general admission). Afternoon in Saint-Germain-des-Pres.', activities: JSON.stringify(['Private Louvre tour', 'Saint-Germain exploration', 'Cafe de Flore', 'Luxembourg Gardens']), accommodation: 'Same hotel' },
    { dayNumber: 3, title: 'Montmartre & Marais', location: 'Paris', description: 'Morning in Montmartre. Afternoon exploring Le Marais, boutique shopping, and falafel on Rue des Rosiers.', activities: JSON.stringify(['Montmartre walking tour', 'Sacre-Coeur', 'Le Marais exploration', 'Boutique shopping']), accommodation: 'Same hotel' },
    { dayNumber: 4, title: 'Versailles Day Trip', location: 'Versailles', description: 'Private guided tour of Versailles with skip-the-line access. Evening back in Paris for a Michelin dinner.', activities: JSON.stringify(['Versailles private tour', 'Gardens exploration', 'Michelin dinner']), accommodation: 'Same hotel' },
    { dayNumber: 5, title: 'TGV to Provence', location: 'Avignon', description: 'First-class TGV to Avignon. Afternoon exploring the Papal Palace and Pont d\'Avignon. Welcome dinner at a Provencal restaurant.', activities: JSON.stringify(['TGV Paris to Avignon', 'Papal Palace', 'Pont d\'Avignon', 'Welcome dinner']), accommodation: 'La Mirande Hotel, Avignon' },
    { dayNumber: 6, title: 'Luberon Villages', location: 'Luberon', description: 'Private driver through the hilltop villages of Gordes, Roussillon, and Bonnieux. Market shopping and wine tasting.', activities: JSON.stringify(['Gordes village', 'Roussillon ochre cliffs', 'Bonnieux', 'Local wine tasting']), accommodation: 'Same hotel' },
    { dayNumber: 7, title: 'Aix-en-Provence', location: 'Aix-en-Provence', description: 'Cooking class in the morning. Afternoon exploring Cours Mirabeau and Cezanne\'s studio.', activities: JSON.stringify(['Provencal cooking class', 'Cours Mirabeau', 'Cezanne atelier', 'Market browsing']), accommodation: 'Villa Gallici or similar, Aix' },
    { dayNumber: 8, title: 'Wine Country', location: 'Chateauneuf-du-Pape', description: 'Full day in the vineyards. Private tastings at top estates. Lunch among the vines.', activities: JSON.stringify(['Chateauneuf-du-Pape tastings', 'Vineyard lunch', 'Pont du Gard visit']), accommodation: 'Same hotel' },
    { dayNumber: 9, title: 'Cassis & Calanques', location: 'Cassis', description: 'Day trip to the coastal town of Cassis. Optional boat trip through the Calanques. Farewell dinner.', activities: JSON.stringify(['Cassis town exploration', 'Calanques boat trip', 'Farewell dinner']), accommodation: 'Same hotel' },
    { dayNumber: 10, title: 'Departure', location: 'Marseille / Aix', description: 'Leisurely morning. Private transfer to Marseille airport for departure.', activities: JSON.stringify(['Morning at leisure', 'Airport transfer']), accommodation: 'Departure' },
  ]
  for (const d of parisDays) {
    await prisma.templateDay.create({ data: { ...d, templateId: t2.id } })
  }

  // Template 3: Romantic Italy
  const t3 = await prisma.itineraryTemplate.create({
    data: {
      title: 'Romantic Italy: Rome, Florence & Amalfi',
      destination: 'Rome, Florence & Amalfi Coast',
      country: 'Italy',
      region: 'Southern Europe',
      flagEmoji: '🇮🇹',
      summary: 'A 12-day Italian dream: ancient Rome, Renaissance Florence, and the sun-soaked Amalfi Coast. Art, food, and amore.',
      description: 'Italy\'s greatest hits done with depth and elegance. Begin in Rome with private Vatican access and neighborhood trattorias, train to Florence for art and Tuscan wine, then south to the Amalfi Coast for cliff-top dining and boat trips along the coast. Perfect for couples, honeymooners, and anyone who wants to fall in love with Italy.',
      durationDays: 12,
      travelStyles: JSON.stringify(['ROMANTIC', 'CULTURAL', 'FOODIE', 'LUXURY']),
      travelerTypes: JSON.stringify(['COUPLE', 'HONEYMOON', 'ANNIVERSARY']),
      budgetLevel: 'TEN_TO_20K',
      paceLevel: 'moderate',
      tags: JSON.stringify(['signature', 'bestseller', 'romantic', 'cultural']),
      status: 'ACTIVE',
      isFeatured: true,
      isBestSeller: true,
      isSignature: false,
      bestMonths: JSON.stringify([4, 5, 6, 9, 10]),
      highlights: JSON.stringify(['Private Vatican early access', 'Pasta-making class in Trastevere', 'Uffizi Gallery private tour', 'Chianti wine tasting', 'Private boat along Amalfi Coast', 'Ravello sunset dinner', 'Capri day trip']),
      includes: JSON.stringify(['All accommodations', 'Private guides in Rome and Florence', 'Train tickets', 'Private boat day', 'Cooking class', 'Wine tasting', 'Daily breakfast', 'Airport transfers']),
      excludes: JSON.stringify(['International flights', 'Travel insurance', 'Most dinners']),
      basePrice: 14000,
      priceNotes: 'Per person. Peak summer dates (July-Aug) add 15%.',
    },
  })
  templates.push(t3)
  const italyDays = [
    { dayNumber: 1, title: 'Arrival in Rome', location: 'Rome', description: 'Welcome to the Eternal City. Private transfer. Evening passeggiata through the historic center.', activities: JSON.stringify(['Airport transfer', 'Hotel check-in', 'Evening walk to Trevi Fountain']), accommodation: 'Hotel de Russie or Portrait Roma' },
    { dayNumber: 2, title: 'Ancient Rome', location: 'Rome', description: 'Private tour of the Colosseum, Forum, and Palatine Hill. Afternoon in Trastevere.', activities: JSON.stringify(['Colosseum private tour', 'Roman Forum', 'Trastevere lunch', 'Evening aperitivo']), accommodation: 'Same hotel' },
    { dayNumber: 3, title: 'Vatican & Cooking', location: 'Rome', description: 'Early-access Vatican tour. Afternoon pasta-making class.', activities: JSON.stringify(['Vatican early access', 'Sistine Chapel', 'Pasta-making class', 'Trastevere dinner']), accommodation: 'Same hotel' },
    { dayNumber: 4, title: 'Train to Florence', location: 'Florence', description: 'High-speed train to Florence. Afternoon exploring the Duomo and Ponte Vecchio.', activities: JSON.stringify(['Train to Florence', 'Duomo complex', 'Ponte Vecchio', 'Gelato tasting']), accommodation: 'Hotel Lungarno or Portrait Firenze' },
    { dayNumber: 5, title: 'Uffizi & Oltrarno', location: 'Florence', description: 'Private Uffizi tour. Afternoon in the Oltrarno artisan quarter.', activities: JSON.stringify(['Uffizi private tour', 'Oltrarno workshops', 'San Miniato sunset']), accommodation: 'Same hotel' },
    { dayNumber: 6, title: 'Tuscan Wine Day', location: 'Chianti', description: 'Full day in Chianti wine country with private driver. Visit estates and hilltop villages.', activities: JSON.stringify(['Chianti wine estates', 'Greve in Chianti', 'Tuscan lunch', 'Olive oil tasting']), accommodation: 'Same hotel' },
    { dayNumber: 7, title: 'To Amalfi Coast', location: 'Amalfi Coast', description: 'Train to Naples, then private transfer along the stunning Amalfi Coast road to Positano.', activities: JSON.stringify(['Train to Naples', 'Coastal drive', 'Positano arrival', 'Beach time']), accommodation: 'Le Sirenuse or Il San Pietro' },
    { dayNumber: 8, title: 'Positano Day', location: 'Positano', description: 'Leisurely day. Beach clubs, boutique shopping on the main path, and a cliffside dinner.', activities: JSON.stringify(['Beach club morning', 'Positano exploration', 'Cliffside dinner']), accommodation: 'Same hotel' },
    { dayNumber: 9, title: 'Private Boat Day', location: 'Amalfi Coast', description: 'Private boat along the coast. Swim in hidden coves, visit Amalfi town, lunch on the water.', activities: JSON.stringify(['Private boat charter', 'Hidden swimming coves', 'Amalfi town visit', 'On-board lunch']), accommodation: 'Same hotel' },
    { dayNumber: 10, title: 'Ravello', location: 'Ravello', description: 'Visit Ravello\'s Villa Rufolo gardens. Sunset concert if available. Dinner with panoramic views.', activities: JSON.stringify(['Ravello gardens', 'Villa Cimbrone', 'Sunset dinner']), accommodation: 'Same hotel' },
    { dayNumber: 11, title: 'Capri Day Trip', location: 'Capri', description: 'Ferry to Capri. Blue Grotto visit, chairlift to Monte Solaro, lunch in the piazzetta.', activities: JSON.stringify(['Ferry to Capri', 'Blue Grotto', 'Monte Solaro chairlift', 'Piazzetta lunch']), accommodation: 'Same hotel' },
    { dayNumber: 12, title: 'Departure', location: 'Naples', description: 'Private transfer to Naples airport. Arrivederci, Italia!', activities: JSON.stringify(['Farewell breakfast', 'Airport transfer']), accommodation: 'Departure' },
  ]
  for (const d of italyDays) {
    await prisma.templateDay.create({ data: { ...d, templateId: t3.id } })
  }

  // Template 4: Romantic Greece
  const t4 = await prisma.itineraryTemplate.create({
    data: {
      title: 'Greek Island Romance',
      destination: 'Athens & Santorini',
      country: 'Greece',
      region: 'Mediterranean',
      flagEmoji: '🇬🇷',
      summary: 'A 9-day escape through Athens and Santorini: ancient ruins, caldera sunsets, and island serenity.',
      description: 'Start in Athens with guided tours of the Acropolis and hidden neighborhood tavernas, then fly to Santorini for caldera views, wine tasting in volcanic vineyards, and sunset dinners in Oia. Designed for romance and relaxation.',
      durationDays: 9,
      travelStyles: JSON.stringify(['ROMANTIC', 'LUXURY', 'SCENIC', 'CULTURAL']),
      travelerTypes: JSON.stringify(['COUPLE', 'HONEYMOON', 'ANNIVERSARY']),
      budgetLevel: 'TEN_TO_20K',
      paceLevel: 'slow',
      status: 'ACTIVE', isFeatured: true, isBestSeller: false, isSignature: true,
      bestMonths: JSON.stringify([5, 6, 9, 10]),
      highlights: JSON.stringify(['Acropolis private tour', 'Plaka neighborhood dining', 'Santorini caldera hotel', 'Oia sunset', 'Volcanic wine tasting', 'Catamaran cruise', 'Red Beach visit']),
      includes: JSON.stringify(['All accommodations', 'Athens private guide', 'Domestic flight', 'Catamaran cruise', 'Wine tasting', 'Daily breakfast']),
      excludes: JSON.stringify(['International flights', 'Travel insurance', 'Most meals']),
      basePrice: 9500,
      priceNotes: 'Per person. Caldera-view room upgrade available.',
    },
  })
  templates.push(t4)

  // Template 5: Switzerland Scenic
  const t5 = await prisma.itineraryTemplate.create({
    data: {
      title: 'Swiss Alps Scenic Escape',
      destination: 'Lucerne, Interlaken & Zermatt',
      country: 'Switzerland',
      region: 'Central Europe',
      flagEmoji: '🇨🇭',
      summary: 'A 7-day journey through Switzerland\'s most dramatic Alpine scenery: lakes, peaks, and pristine mountain villages.',
      description: 'Switzerland done right. Travel by scenic train from Lucerne to Interlaken to Zermatt, hitting the most beautiful landscapes in Europe. Includes lake cruises, mountain railways, and stays in properties with jaw-dropping views.',
      durationDays: 7,
      travelStyles: JSON.stringify(['SCENIC', 'LUXURY', 'ADVENTURE']),
      travelerTypes: JSON.stringify(['COUPLE', 'FAMILY_TEENS', 'GROUP_FRIENDS']),
      budgetLevel: 'TEN_TO_20K',
      paceLevel: 'moderate',
      status: 'ACTIVE', isFeatured: true, isBestSeller: false, isSignature: false,
      bestMonths: JSON.stringify([6, 7, 8, 9, 12, 1, 2]),
      highlights: JSON.stringify(['Glacier Express train', 'Jungfraujoch Top of Europe', 'Lake Lucerne cruise', 'Matterhorn views', 'Swiss chocolate tasting', 'Fondue experience', 'Mountain railway rides']),
      includes: JSON.stringify(['All accommodations', 'Swiss Travel Pass', 'Glacier Express', 'Mountain excursions', 'Daily breakfast']),
      excludes: JSON.stringify(['International flights', 'Travel insurance', 'Most meals']),
      basePrice: 11000,
      priceNotes: 'Per person. Ski season rates differ.',
    },
  })
  templates.push(t5)

  // Template 6: London + Paris
  const t6 = await prisma.itineraryTemplate.create({
    data: {
      title: 'London & Paris Classic',
      destination: 'London & Paris',
      country: 'UK & France',
      region: 'Western Europe',
      flagEmoji: '🇬🇧',
      summary: 'A 9-day classic combining London\'s cultural depth with Parisian elegance. Connected by the Eurostar.',
      description: 'The ultimate first-time Europe trip or a refined revisit for those who know these cities have more to offer. London brings world-class museums, theatre, and neighborhoods full of character. Paris delivers art, cuisine, and romance. Connected by a seamless Eurostar journey under the Channel.',
      durationDays: 9,
      travelStyles: JSON.stringify(['CULTURAL', 'LUXURY', 'FOODIE']),
      travelerTypes: JSON.stringify(['COUPLE', 'FAMILY_TEENS', 'GROUP_FRIENDS', 'SOLO']),
      budgetLevel: 'FIVE_TO_10K',
      paceLevel: 'moderate',
      status: 'ACTIVE', isFeatured: false, isBestSeller: true, isSignature: false,
      bestMonths: JSON.stringify([4, 5, 6, 9, 10]),
      highlights: JSON.stringify(['Tower of London', 'West End theatre', 'Borough Market', 'Eurostar crossing', 'Eiffel Tower', 'Louvre Museum', 'Montmartre walk', 'Seine river cruise']),
      includes: JSON.stringify(['All accommodations', 'Eurostar tickets', 'London walking tour', 'Paris museum pass', 'Daily breakfast']),
      excludes: JSON.stringify(['International flights', 'Travel insurance', 'Most meals', 'Theatre tickets']),
      basePrice: 6500,
      priceNotes: 'Per person based on double occupancy.',
    },
  })
  templates.push(t6)

  // Template 7: Spain Food + Culture
  const t7 = await prisma.itineraryTemplate.create({
    data: {
      title: 'Spain: Barcelona, San Sebastian & Madrid',
      destination: 'Barcelona, San Sebastian & Madrid',
      country: 'Spain',
      region: 'Southern Europe',
      flagEmoji: '🇪🇸',
      summary: 'An 11-day culinary and cultural journey through Spain\'s most vibrant cities.',
      description: 'From Gaudi\'s Barcelona to the pintxos bars of San Sebastian to Madrid\'s Prado Museum and tapas scene, this trip is for travelers who eat their way through a destination. Includes cooking classes, market tours, and reservations at Spain\'s best restaurants.',
      durationDays: 11,
      travelStyles: JSON.stringify(['FOODIE', 'CULTURAL', 'ADVENTURE']),
      travelerTypes: JSON.stringify(['COUPLE', 'GROUP_FRIENDS', 'SOLO']),
      budgetLevel: 'FIVE_TO_10K',
      paceLevel: 'moderate',
      status: 'ACTIVE', isFeatured: false, isBestSeller: false, isSignature: false,
      bestMonths: JSON.stringify([4, 5, 6, 9, 10]),
      highlights: JSON.stringify(['Sagrada Familia', 'La Boqueria Market', 'Pintxos crawl in San Sebastian', 'Paella cooking class', 'Prado Museum', 'Flamenco show in Madrid', 'Rioja wine region day trip']),
      includes: JSON.stringify(['All accommodations', 'Domestic trains', 'Cooking class', 'Guided tapas tours', 'Daily breakfast']),
      excludes: JSON.stringify(['International flights', 'Travel insurance', 'Most meals']),
      basePrice: 5800,
      priceNotes: 'Per person. Restaurant reservations at top spots require 60+ days advance.',
    },
  })
  templates.push(t7)

  // Template 8: Christmas Markets
  const t8 = await prisma.itineraryTemplate.create({
    data: {
      title: 'European Christmas Markets',
      destination: 'Vienna, Salzburg & Munich',
      country: 'Austria & Germany',
      region: 'Central Europe',
      flagEmoji: '🎄',
      summary: 'A magical 7-day journey through the best Christmas markets in Europe. Mulled wine, festive lights, and Alpine charm.',
      description: 'Experience the magic of European Christmas markets at their finest. Start in Vienna with its grand imperial markets, continue to Salzburg\'s atmospheric Christkindlmarkt, and finish in Munich\'s beloved Marienplatz market. Includes cozy hotel stays, guided market tours, and a horse-drawn sleigh ride.',
      durationDays: 7,
      travelStyles: JSON.stringify(['CULTURAL', 'ROMANTIC', 'FOODIE']),
      travelerTypes: JSON.stringify(['COUPLE', 'FAMILY_TEENS', 'GROUP_FRIENDS']),
      budgetLevel: 'FIVE_TO_10K',
      paceLevel: 'moderate',
      status: 'ACTIVE', isFeatured: false, isBestSeller: true, isSignature: false,
      bestMonths: JSON.stringify([11, 12]),
      highlights: JSON.stringify(['Vienna Rathaus market', 'Salzburg Christkindlmarkt', 'Munich Marienplatz', 'Horse-drawn sleigh ride', 'Austrian pastry workshop', 'Mozart concert in Salzburg', 'Mulled wine tasting trail']),
      includes: JSON.stringify(['All accommodations', 'Train tickets', 'Guided market tours', 'Pastry workshop', 'Concert tickets', 'Daily breakfast']),
      excludes: JSON.stringify(['International flights', 'Travel insurance', 'Most meals']),
      basePrice: 5500,
      priceNotes: 'Per person. Book early — December dates sell fast.',
    },
  })
  templates.push(t8)

  // Template 9: Luxury Paris Weekend
  const t9 = await prisma.itineraryTemplate.create({
    data: {
      title: 'Luxury Paris Long Weekend',
      destination: 'Paris',
      country: 'France',
      region: 'Western Europe',
      flagEmoji: '🇫🇷',
      summary: 'A 4-day ultra-luxury Parisian escape: palace hotels, private shopping, and Michelin-starred dining.',
      description: 'For travelers who want to experience Paris at its most elevated. Stay at a palace hotel, shop with a private stylist, dine at multiple Michelin-starred restaurants, and enjoy after-hours museum access. Pure Parisian luxury.',
      durationDays: 4,
      travelStyles: JSON.stringify(['LUXURY', 'FOODIE', 'ROMANTIC']),
      travelerTypes: JSON.stringify(['COUPLE', 'HONEYMOON', 'ANNIVERSARY']),
      budgetLevel: 'OVER_20K',
      paceLevel: 'slow',
      status: 'ACTIVE', isFeatured: false, isBestSeller: false, isSignature: true,
      bestMonths: JSON.stringify([3, 4, 5, 6, 9, 10, 11]),
      highlights: JSON.stringify(['Palace hotel stay', 'Private Louvre after-hours', 'Michelin 3-star dinner', 'Private shopping stylist', 'Seine private cruise', 'Champagne at rooftop bar']),
      includes: JSON.stringify(['Palace hotel', 'Private car service', 'Restaurant reservations', 'Museum access', 'Daily breakfast']),
      excludes: JSON.stringify(['Flights', 'Shopping purchases', 'Travel insurance']),
      basePrice: 18000,
      priceNotes: 'Per person. Ultra-luxury tier.',
    },
  })
  templates.push(t9)

  // Template 10: Scandinavian Summer
  const t10 = await prisma.itineraryTemplate.create({
    data: {
      title: 'Scandinavian Summer: Norway & Denmark',
      destination: 'Copenhagen & Norwegian Fjords',
      country: 'Denmark & Norway',
      region: 'Nordic',
      flagEmoji: '🇳🇴',
      summary: 'A 10-day Nordic adventure: Copenhagen\'s cool design scene meets Norway\'s dramatic fjords.',
      description: 'Start in Copenhagen for hygge, New Nordic cuisine, and design-forward architecture. Fly to Bergen and embark on a fjord cruise through some of the most dramatic scenery on Earth. End in Oslo with museums and waterfront dining.',
      durationDays: 10,
      travelStyles: JSON.stringify(['SCENIC', 'CULTURAL', 'ADVENTURE', 'FOODIE']),
      travelerTypes: JSON.stringify(['COUPLE', 'GROUP_FRIENDS', 'FAMILY_TEENS']),
      budgetLevel: 'TEN_TO_20K',
      paceLevel: 'moderate',
      status: 'ACTIVE', isFeatured: false, isBestSeller: false, isSignature: false,
      bestMonths: JSON.stringify([6, 7, 8]),
      highlights: JSON.stringify(['Nyhavn waterfront', 'Noma-style dining', 'Bergen Bryggen wharf', 'Sognefjord cruise', 'Flam Railway', 'Norwegian fjord hiking', 'Oslo Opera House', 'Midnight sun experience']),
      includes: JSON.stringify(['All accommodations', 'Domestic flights', 'Fjord cruise', 'Flam Railway', 'Guided tours', 'Daily breakfast']),
      excludes: JSON.stringify(['International flights', 'Travel insurance', 'Most meals']),
      basePrice: 10500,
      priceNotes: 'Per person. Summer only — June through August.',
    },
  })
  templates.push(t10)

  // Template 11: Family London + Paris
  const t11 = await prisma.itineraryTemplate.create({
    data: {
      title: 'Family Europe: London & Paris',
      destination: 'London & Paris',
      country: 'UK & France',
      region: 'Western Europe',
      flagEmoji: '🇬🇧',
      summary: 'An 8-day family-friendly adventure through London and Paris that keeps everyone happy — from teens to grandparents.',
      description: 'Designed for multi-generational families. London brings Harry Potter experiences, the Tower of London, and West End shows. Paris delivers the Eiffel Tower, crepe-making classes, and boat rides on the Seine. Pacing is family-friendly with built-in downtime.',
      durationDays: 8,
      travelStyles: JSON.stringify(['FAMILY', 'CULTURAL']),
      travelerTypes: JSON.stringify(['FAMILY_YOUNG_KIDS', 'FAMILY_TEENS', 'MULTI_GEN']),
      budgetLevel: 'FIVE_TO_10K',
      paceLevel: 'moderate',
      status: 'ACTIVE', isFeatured: false, isBestSeller: false, isSignature: false,
      bestMonths: JSON.stringify([4, 5, 6, 7, 9, 10]),
      highlights: JSON.stringify(['Harry Potter Studio Tour', 'Tower of London', 'West End musical', 'Eurostar experience', 'Eiffel Tower summit', 'Crepe-making class', 'Versailles day trip', 'Seine boat tour']),
      includes: JSON.stringify(['Family accommodations', 'Eurostar tickets', 'Activity bookings', 'Museum passes', 'Daily breakfast']),
      excludes: JSON.stringify(['International flights', 'Travel insurance', 'Most meals']),
      basePrice: 4500,
      priceNotes: 'Per person adult rate. Children discounted.',
    },
  })
  templates.push(t11)

  // Template 12: Amalfi + Rome
  const t12 = await prisma.itineraryTemplate.create({
    data: {
      title: 'Amalfi Coast & Rome Getaway',
      destination: 'Rome & Amalfi Coast',
      country: 'Italy',
      region: 'Southern Europe',
      flagEmoji: '🇮🇹',
      summary: 'A 7-day Italian escape combining ancient Rome with the coastal beauty of Amalfi. History meets la dolce vita.',
      description: 'A shorter but perfectly paced Italy trip. Three nights in Rome for the classics, then a scenic drive south to the Amalfi Coast for three nights of cliffside luxury, lemon groves, and Mediterranean sunsets.',
      durationDays: 7,
      travelStyles: JSON.stringify(['ROMANTIC', 'CULTURAL', 'SCENIC']),
      travelerTypes: JSON.stringify(['COUPLE', 'HONEYMOON']),
      budgetLevel: 'FIVE_TO_10K',
      paceLevel: 'moderate',
      status: 'ACTIVE', isFeatured: false, isBestSeller: false, isSignature: false,
      bestMonths: JSON.stringify([4, 5, 6, 9, 10]),
      highlights: JSON.stringify(['Colosseum private tour', 'Trastevere food walk', 'Amalfi Coast drive', 'Positano beach clubs', 'Limoncello tasting', 'Path of the Gods hike']),
      includes: JSON.stringify(['All accommodations', 'Private Rome guide', 'Coastal transfer', 'Food walk', 'Daily breakfast']),
      excludes: JSON.stringify(['Flights', 'Travel insurance', 'Most meals']),
      basePrice: 6000,
      priceNotes: 'Per person based on double occupancy.',
    },
  })
  templates.push(t12)

  console.log(`Created ${templates.length} templates with day plans`)

  // ==================== TRIP COLLECTIONS ====================
  const col1 = await prisma.tripCollection.create({ data: { title: 'Europe Honeymoons', description: 'Our most romantic European itineraries for honeymooners and anniversary couples.', emoji: '💕', sortOrder: 1 } })
  const col2 = await prisma.tripCollection.create({ data: { title: 'First-Time Europe', description: 'Classic European introductions for travelers making their first trip across the Atlantic.', emoji: '🌍', sortOrder: 2 } })
  const col3 = await prisma.tripCollection.create({ data: { title: 'Luxury Slow Travel', description: 'Unhurried, elevated itineraries for travelers who prefer depth over distance.', emoji: '✨', sortOrder: 3 } })
  const col4 = await prisma.tripCollection.create({ data: { title: 'Adventure & Nature', description: 'Active, outdoor-focused trips for travelers who want to explore the natural world.', emoji: '🏔️', sortOrder: 4 } })
  const col5 = await prisma.tripCollection.create({ data: { title: 'Family Travel', description: 'Thoughtfully designed family trips that keep all generations engaged and happy.', emoji: '👨‍👩‍👧‍👦', sortOrder: 5 } })
  const col6 = await prisma.tripCollection.create({ data: { title: 'Food & Wine Journeys', description: 'Culinary-forward itineraries for travelers who eat their way through a destination.', emoji: '🍷', sortOrder: 6 } })

  // Collection items
  const collectionItems = [
    { collectionId: col1.id, templateId: t2.id, sortOrder: 1 },
    { collectionId: col1.id, templateId: t3.id, sortOrder: 2 },
    { collectionId: col1.id, templateId: t4.id, sortOrder: 3 },
    { collectionId: col1.id, templateId: t9.id, sortOrder: 4 },
    { collectionId: col2.id, templateId: t6.id, sortOrder: 1 },
    { collectionId: col2.id, templateId: t3.id, sortOrder: 2 },
    { collectionId: col2.id, templateId: t12.id, sortOrder: 3 },
    { collectionId: col3.id, templateId: t2.id, sortOrder: 1 },
    { collectionId: col3.id, templateId: t9.id, sortOrder: 2 },
    { collectionId: col3.id, templateId: t4.id, sortOrder: 3 },
    { collectionId: col4.id, templateId: t1.id, sortOrder: 1 },
    { collectionId: col4.id, templateId: t5.id, sortOrder: 2 },
    { collectionId: col4.id, templateId: t10.id, sortOrder: 3 },
    { collectionId: col5.id, templateId: t11.id, sortOrder: 1 },
    { collectionId: col5.id, templateId: t6.id, sortOrder: 2 },
    { collectionId: col6.id, templateId: t7.id, sortOrder: 1 },
    { collectionId: col6.id, templateId: t2.id, sortOrder: 2 },
    { collectionId: col6.id, templateId: t3.id, sortOrder: 3 },
  ]
  for (const item of collectionItems) {
    await prisma.tripCollectionItem.create({ data: item })
  }
  console.log('Created collections and linked templates')

  // ==================== PAST TRIPS ====================
  const pastTrips = [
    { title: 'Sarah & James Honeymoon', destination: 'Amalfi Coast', country: 'Italy', flagEmoji: '🇮🇹', clientName: 'Sarah & James T.', tripDate: 'June 2024', durationDays: 10, summary: 'A dream honeymoon along the Amalfi Coast with private boats, cliffside dining, and a surprise sunset proposal re-enactment in Ravello.', highlights: JSON.stringify(['Private boat to Capri', 'Le Sirenuse suite', 'Ravello sunset dinner', 'Cooking class in Positano', 'Limoncello farm visit']), travelStyle: 'ROMANTIC', travelerType: 'HONEYMOON', budgetLevel: 'TEN_TO_20K', testimonial: 'We told them we wanted to feel like we were in a dream. That\'s exactly what they built. Every single detail was perfect.', rating: 5, advisorNotes: 'This couple was extremely detail-oriented. The re-created proposal moment in Ravello was the highlight of my year.' },
    { title: 'Nakamura Family Japan', destination: 'Tokyo & Kyoto', country: 'Japan', flagEmoji: '🇯🇵', clientName: 'The Nakamura Family', tripDate: 'April 2024', durationDays: 14, summary: 'Three generations exploring Japan during cherry blossom season. From robot restaurants to traditional ryokans.', highlights: JSON.stringify(['Cherry blossom viewing', 'Ryokan stay', 'Sushi-making class', 'Fushimi Inari dawn visit', 'Robot Restaurant']), travelStyle: 'CULTURAL', travelerType: 'MULTI_GEN', budgetLevel: 'TEN_TO_20K', testimonial: 'Three generations, three very different wish lists. Somehow Voyagr found a route that made everyone happy.', rating: 5 },
    { title: 'Mark D. Solo Iceland', destination: 'Iceland Ring Road', country: 'Iceland', flagEmoji: '🇮🇸', clientName: 'Mark D.', tripDate: 'February 2024', durationDays: 8, summary: 'A solo adventure around Iceland\'s Ring Road in winter. Northern lights, glacier hikes, and hot springs under the stars.', highlights: JSON.stringify(['Northern lights 3 nights', 'Glacier hike', 'Secret hot springs', 'Ice cave exploration', 'Whale watching']), travelStyle: 'ADVENTURE', travelerType: 'SOLO', budgetLevel: 'FIVE_TO_10K', testimonial: 'She knew the best roads for the northern lights, which hot springs weren\'t overrun. Worth every penny.', rating: 5 },
    { title: 'Chen Anniversary Paris', destination: 'Paris & Loire Valley', country: 'France', flagEmoji: '🇫🇷', clientName: 'David & Lisa C.', tripDate: 'October 2024', durationDays: 7, summary: 'A 25th anniversary celebration in Paris with a Loire Valley chateau stay. Private wine tastings and Michelin dining.', highlights: JSON.stringify(['Michelin 2-star dinner', 'Private Loire Valley tour', 'Chateau hotel stay', 'Cooking class', 'Seine sunset cruise']), travelStyle: 'LUXURY', travelerType: 'ANNIVERSARY', budgetLevel: 'OVER_20K', testimonial: 'After 25 years together, this trip reminded us why we fell in love. The chateau was beyond anything we imagined.', rating: 5 },
    { title: 'Rodriguez Family Italy', destination: 'Rome, Florence & Venice', country: 'Italy', flagEmoji: '🇮🇹', clientName: 'The Rodriguez Family', tripDate: 'July 2024', durationDays: 12, summary: 'A family of five exploring Italy\'s greatest hits. Kid-friendly pace with adult-quality experiences.', highlights: JSON.stringify(['Gladiator school for kids', 'Gelato-making class', 'Venice gondola ride', 'Tuscan farmhouse stay', 'Pizza-making in Naples']), travelStyle: 'FAMILY', travelerType: 'FAMILY_TEENS', budgetLevel: 'FIVE_TO_10K', testimonial: 'Our teenagers actually put their phones down. That says it all. The gladiator school was genius.', rating: 5 },
    { title: 'Williams Group Greece', destination: 'Athens, Mykonos & Santorini', country: 'Greece', flagEmoji: '🇬🇷', clientName: 'The Williams Group', tripDate: 'September 2024', durationDays: 10, summary: 'Six college friends reuniting for a Greek island-hopping adventure. Beach clubs, sailing, and endless sunsets.', highlights: JSON.stringify(['Catamaran sailing day', 'Mykonos beach clubs', 'Santorini wine tour', 'Oia sunset dinner', 'Athens food tour']), travelStyle: 'ADVENTURE', travelerType: 'GROUP_FRIENDS', budgetLevel: 'FIVE_TO_10K', testimonial: 'Best friends trip of our lives. The catamaran day in Santorini was absolutely unforgettable.', rating: 5 },
    { title: 'Thompson Christmas Markets', destination: 'Vienna & Prague', country: 'Austria & Czech Republic', flagEmoji: '🎄', clientName: 'Karen & Bob T.', tripDate: 'December 2023', durationDays: 7, summary: 'A festive holiday trip through Vienna and Prague\'s Christmas markets. Imperial grandeur meets holiday magic.', highlights: JSON.stringify(['Vienna Rathaus market', 'Sachertorte at Hotel Sacher', 'Prague Old Town Square market', 'Horse carriage ride', 'Mozart concert']), travelStyle: 'CULTURAL', travelerType: 'COUPLE', budgetLevel: 'FIVE_TO_10K', testimonial: 'It felt like stepping into a Hallmark movie, except the food was incredible and the hotels were gorgeous.', rating: 5 },
    { title: 'Patel Honeymoon Maldives', destination: 'Maldives', country: 'Maldives', flagEmoji: '🇲🇻', clientName: 'Priya & Raj P.', tripDate: 'January 2025', durationDays: 7, summary: 'An ultra-luxury overwater villa honeymoon in the Maldives. Complete serenity, world-class diving, and spa treatments.', highlights: JSON.stringify(['Overwater villa', 'Private dining on sandbank', 'Sunset dolphin cruise', 'Couples spa treatment', 'Snorkeling with manta rays']), travelStyle: 'LUXURY', travelerType: 'HONEYMOON', budgetLevel: 'OVER_20K', testimonial: 'Pure paradise. The private sandbank dinner under the stars was the most romantic moment of our lives.', rating: 5 },
  ]
  for (const trip of pastTrips) {
    await prisma.pastTrip.create({ data: trip })
  }
  console.log('Created past trips')

  // ==================== CUSTOMER LEADS ====================
  const leadsData = [
    { firstName: 'Emily', lastName: 'Watson', email: 'emily.watson@example.com', phone: '+1 (555) 234-5678', status: 'NEW', source: 'website_survey' },
    { firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@example.com', phone: '+1 (555) 345-6789', status: 'CONTACTED', source: 'website_survey' },
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@example.com', phone: '+1 (555) 456-7890', status: 'PLANNING', source: 'website_survey' },
    { firstName: 'David', lastName: 'Kim', email: 'david.kim@example.com', phone: '+1 (555) 567-8901', status: 'PLANNING', source: 'website_survey' },
    { firstName: 'Jessica', lastName: 'Martinez', email: 'jessica.martinez@example.com', phone: '+1 (555) 678-9012', status: 'PROPOSAL_SENT', source: 'website_survey' },
    { firstName: 'Robert', lastName: 'Taylor', email: 'robert.taylor@example.com', phone: '+1 (555) 789-0123', status: 'PROPOSAL_SENT', source: 'referral' },
    { firstName: 'Amanda', lastName: 'Brown', email: 'amanda.brown@example.com', phone: '+1 (555) 890-1234', status: 'BOOKED', source: 'website_survey' },
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@example.com', phone: '+1 (555) 901-2345', status: 'BOOKED', source: 'website_survey' },
    { firstName: 'Lauren', lastName: 'Davis', email: 'lauren.davis@example.com', phone: '+1 (555) 012-3456', status: 'COMPLETED', source: 'website_survey' },
    { firstName: 'Christopher', lastName: 'Moore', email: 'chris.moore@example.com', status: 'NEW', source: 'website_survey' },
    { firstName: 'Natalie', lastName: 'Anderson', email: 'natalie.anderson@example.com', phone: '+1 (555) 111-2222', status: 'NEW', source: 'website_survey' },
    { firstName: 'Thomas', lastName: 'Garcia', email: 'thomas.garcia@example.com', phone: '+1 (555) 333-4444', status: 'CONTACTED', source: 'instagram' },
    { firstName: 'Rachel', lastName: 'Lee', email: 'rachel.lee@example.com', status: 'PLANNING', source: 'website_survey' },
    { firstName: 'Daniel', lastName: 'White', email: 'daniel.white@example.com', phone: '+1 (555) 555-6666', status: 'ARCHIVED', source: 'website_survey' },
    { firstName: 'Sophie', lastName: 'Clark', email: 'sophie.clark@example.com', phone: '+1 (555) 777-8888', status: 'NEW', source: 'website_survey' },
  ]

  const leads = []
  for (const ld of leadsData) {
    const lead = await prisma.customerLead.create({ data: ld })
    leads.push(lead)
  }
  console.log('Created leads')

  // ==================== TRIP SURVEYS ====================
  const surveysData = [
    { leadId: leads[0].id, travelerType: 'HONEYMOON', groupSize: 2, tripDurationMin: 10, tripDurationMax: 14, tripMonths: JSON.stringify([6,7]), budget: 'TEN_TO_20K', budgetFlexible: true, destinationsKnown: true, destinationsList: JSON.stringify(['Italy', 'Amalfi Coast']), travelStyles: JSON.stringify(['ROMANTIC', 'LUXURY', 'FOODIE']), pacePreference: 'slow', accommodationType: JSON.stringify(['LUXURY_HOTEL', 'BOUTIQUE']), interests: JSON.stringify(['Food & Wine', 'Beaches & Water', 'Photography', 'History & Architecture']), mustHaveExperiences: 'Private boat ride along the Amalfi Coast, cooking class', avoidExperiences: 'Crowded tourist buses, early mornings', diningImportance: 9, diningStyle: 'mix', countriesVisited: JSON.stringify(['France', 'Spain', 'Mexico']), favoriteTrip: 'Paris for our engagement - the food and romance were incredible', tripFeeling: 'Romantic, dreamy, like we\'re in a movie. Completely disconnected from work.', oneWord: 'Magical', planningInvolvement: 'collaborative', communicationPref: 'email' },
    { leadId: leads[1].id, travelerType: 'COUPLE', groupSize: 2, tripDurationMin: 7, tripDurationMax: 10, tripMonths: JSON.stringify([9,10]), budget: 'FIVE_TO_10K', destinationsKnown: true, destinationsList: JSON.stringify(['Iceland']), travelStyles: JSON.stringify(['ADVENTURE', 'SCENIC']), pacePreference: 'moderate', interests: JSON.stringify(['Nature & Wildlife', 'Photography', 'Hiking & Trekking']), mustHaveExperiences: 'Northern lights, glacier hike', avoidExperiences: 'Too much driving in one day', diningImportance: 6, diningStyle: 'local', tripFeeling: 'Adventurous but not extreme. Want to feel awed by nature.', oneWord: 'Epic', planningInvolvement: 'collaborative', communicationPref: 'video' },
    { leadId: leads[2].id, travelerType: 'FAMILY_TEENS', groupSize: 4, childrenAges: JSON.stringify(['14', '16']), tripDurationMin: 10, tripDurationMax: 14, tripMonths: JSON.stringify([7,8]), budget: 'FIVE_TO_10K', destinationsKnown: true, destinationsList: JSON.stringify(['London', 'Paris']), travelStyles: JSON.stringify(['CULTURAL', 'FAMILY']), pacePreference: 'moderate', interests: JSON.stringify(['History & Architecture', 'Food & Wine', 'Shopping']), mustHaveExperiences: 'Harry Potter tour, Eiffel Tower', diningImportance: 7, diningStyle: 'mix', tripFeeling: 'Fun for the whole family but also cultural. Want the kids to learn something.', oneWord: 'Unforgettable', planningInvolvement: 'collaborative', communicationPref: 'email' },
    { leadId: leads[3].id, travelerType: 'COUPLE', groupSize: 2, tripDurationMin: 8, tripDurationMax: 12, budget: 'TEN_TO_20K', budgetFlexible: true, destinationsKnown: false, openToSuggestions: true, destinationOpenTo: JSON.stringify(['europe']), travelStyles: JSON.stringify(['ROMANTIC', 'SCENIC', 'WELLNESS']), pacePreference: 'slow', interests: JSON.stringify(['Wellness & Spas', 'Nature & Wildlife', 'Food & Wine']), tripFeeling: 'Peaceful and rejuvenating. We need to decompress completely.', oneWord: 'Serene', planningInvolvement: 'hands_off', communicationPref: 'email' },
    { leadId: leads[4].id, travelerType: 'ANNIVERSARY', groupSize: 2, tripDurationMin: 7, tripDurationMax: 10, tripMonths: JSON.stringify([5,6]), budget: 'TEN_TO_20K', destinationsKnown: true, destinationsList: JSON.stringify(['Greece', 'Santorini']), travelStyles: JSON.stringify(['ROMANTIC', 'LUXURY']), pacePreference: 'slow', celebrationDetails: '10th wedding anniversary', interests: JSON.stringify(['Beaches & Water', 'Food & Wine', 'Photography']), tripFeeling: 'Romantic and luxurious. We want to reconnect and celebrate.', oneWord: 'Romantic', planningInvolvement: 'collaborative', communicationPref: 'phone' },
    { leadId: leads[5].id, travelerType: 'COUPLE', groupSize: 2, tripDurationMin: 10, tripDurationMax: 14, budget: 'TEN_TO_20K', destinationsKnown: true, destinationsList: JSON.stringify(['Paris', 'Provence']), travelStyles: JSON.stringify(['LUXURY', 'FOODIE', 'CULTURAL']), pacePreference: 'slow', interests: JSON.stringify(['Food & Wine', 'History & Architecture', 'Art & Museums']), mustHaveExperiences: 'Wine tasting, cooking class, lavender fields', tripFeeling: 'Indulgent, cultured, slow and beautiful. We want to savor every moment.', oneWord: 'Exquisite', planningInvolvement: 'collaborative', communicationPref: 'email' },
    { leadId: leads[6].id, travelerType: 'COUPLE', groupSize: 2, tripDurationMin: 7, tripDurationMax: 10, tripMonths: JSON.stringify([8,9]), budget: 'FIVE_TO_10K', destinationsKnown: true, destinationsList: JSON.stringify(['Switzerland']), travelStyles: JSON.stringify(['SCENIC', 'ADVENTURE']), pacePreference: 'moderate', interests: JSON.stringify(['Hiking & Trekking', 'Photography', 'Nature & Wildlife']), tripFeeling: 'Breathtaking views and active exploration with luxury touches.', oneWord: 'Majestic', planningInvolvement: 'collaborative', communicationPref: 'email' },
    { leadId: leads[7].id, travelerType: 'COUPLE', groupSize: 2, tripDurationMin: 10, tripDurationMax: 12, budget: 'TEN_TO_20K', destinationsKnown: true, destinationsList: JSON.stringify(['Barcelona', 'San Sebastian']), travelStyles: JSON.stringify(['FOODIE', 'CULTURAL']), pacePreference: 'moderate', interests: JSON.stringify(['Food & Wine', 'Art & Museums', 'Local Markets']), mustHaveExperiences: 'Pintxos crawl, Sagrada Familia', tripFeeling: 'Vibrant and delicious. We want to eat everything Spain has to offer.', oneWord: 'Savory', planningInvolvement: 'hands_on', communicationPref: 'video' },
    { leadId: leads[8].id, travelerType: 'MULTI_GEN', groupSize: 6, tripDurationMin: 7, tripDurationMax: 10, budget: 'TEN_TO_20K', destinationsKnown: true, destinationsList: JSON.stringify(['Italy']), travelStyles: JSON.stringify(['CULTURAL', 'FAMILY', 'FOODIE']), pacePreference: 'moderate', interests: JSON.stringify(['Food & Wine', 'History & Architecture']), tripFeeling: 'A trip everyone remembers. Three generations making memories together.', oneWord: 'Together', planningInvolvement: 'collaborative', communicationPref: 'phone' },
    { leadId: leads[9].id, travelerType: 'SOLO', groupSize: 1, tripDurationMin: 5, tripDurationMax: 7, budget: 'THREE_TO_5K', destinationsKnown: false, openToSuggestions: true, travelStyles: JSON.stringify(['ADVENTURE', 'CULTURAL']), pacePreference: 'fast', interests: JSON.stringify(['Hiking & Trekking', 'Photography', 'Local Markets']), tripFeeling: 'Free and adventurous. Want to challenge myself.', oneWord: 'Bold', planningInvolvement: 'hands_off', communicationPref: 'email' },
    { leadId: leads[10].id, travelerType: 'COUPLE', groupSize: 2, tripDurationMin: 12, tripDurationMax: 14, budget: 'OVER_20K', budgetFlexible: true, destinationsKnown: true, destinationsList: JSON.stringify(['Paris']), travelStyles: JSON.stringify(['LUXURY', 'ROMANTIC', 'FOODIE']), pacePreference: 'slow', interests: JSON.stringify(['Food & Wine', 'Shopping', 'Art & Museums']), mustHaveExperiences: 'Palace hotel, Michelin stars, private shopping', tripFeeling: 'Ultra-luxury. We want to feel like royalty.', oneWord: 'Opulent', planningInvolvement: 'collaborative', communicationPref: 'phone' },
    { leadId: leads[11].id, travelerType: 'GROUP_FRIENDS', groupSize: 6, tripDurationMin: 7, tripDurationMax: 10, budget: 'FIVE_TO_10K', destinationsKnown: true, destinationsList: JSON.stringify(['Greece']), travelStyles: JSON.stringify(['ADVENTURE', 'SCENIC']), pacePreference: 'fast', interests: JSON.stringify(['Beaches & Water', 'Nightlife', 'Sailing & Boating']), tripFeeling: 'Fun, social, adventurous. Best friends trip ever.', oneWord: 'Epic', planningInvolvement: 'hands_off', communicationPref: 'email' },
    { leadId: leads[12].id, travelerType: 'COUPLE', groupSize: 2, tripDurationMin: 7, tripDurationMax: 10, budget: 'FIVE_TO_10K', destinationsKnown: true, destinationsList: JSON.stringify(['Vienna', 'Prague']), travelStyles: JSON.stringify(['CULTURAL', 'ROMANTIC']), pacePreference: 'moderate', tripMonths: JSON.stringify([12]), interests: JSON.stringify(['History & Architecture', 'Food & Wine']), mustHaveExperiences: 'Christmas markets, Mozart concert', tripFeeling: 'Festive and romantic. We want that European Christmas feeling.', oneWord: 'Enchanting', planningInvolvement: 'collaborative', communicationPref: 'email' },
    { leadId: leads[13].id, travelerType: 'COUPLE', groupSize: 2, tripDurationMin: 5, tripDurationMax: 7, budget: 'THREE_TO_5K', destinationsKnown: false, openToSuggestions: true, travelStyles: JSON.stringify(['CULTURAL']), pacePreference: 'moderate', tripFeeling: 'Just want to get away.', oneWord: 'Escape', planningInvolvement: 'hands_off', communicationPref: 'email' },
    { leadId: leads[14].id, travelerType: 'HONEYMOON', groupSize: 2, tripDurationMin: 10, tripDurationMax: 14, budget: 'TEN_TO_20K', budgetFlexible: true, destinationsKnown: true, destinationsList: JSON.stringify(['Maldives']), travelStyles: JSON.stringify(['LUXURY', 'ROMANTIC', 'WELLNESS']), pacePreference: 'slow', celebrationDetails: 'Honeymoon!', interests: JSON.stringify(['Beaches & Water', 'Wellness & Spas']), mustHaveExperiences: 'Overwater villa, private dinner on the beach', tripFeeling: 'Complete paradise and relaxation. Zero stress.', oneWord: 'Bliss', planningInvolvement: 'hands_off', communicationPref: 'email' },
  ]
  for (const s of surveysData) {
    await prisma.tripSurvey.create({ data: s })
  }
  console.log('Created surveys')

  // ==================== GENERATED SUMMARIES ====================
  const summaries = [
    { leadId: leads[0].id, travelerSummary: 'This honeymooning couple is seeking an unhurried, romantic and luxury travel experience. They want to feel "Romantic, dreamy, like they\'re in a movie" — best captured by the word "Magical." Key interests include Food & Wine, Photography, and History, suggesting deep appreciation for authentic Italian culture.', idealTripStyle: 'Romantic slow travel with Luxury undertones', bestFitDestinations: JSON.stringify([{ destination: 'Amalfi Coast', reason: 'Perfect match for romantic honeymoon with coastal luxury', score: 95 }, { destination: 'Rome', reason: 'Adds cultural depth and world-class dining', score: 88 }]), pacingRecommendation: 'Recommend 2-3 nights minimum per location. Prioritize depth over breadth. Build in unscheduled afternoon time.', routeSuggestion: 'Rome (3 nights) → Amalfi Coast (5 nights). Open in Rome for cultural immersion, then transition to coastal relaxation.', hotelStyle: 'Intimate boutique hotels, cliff-top villas, and private suite retreats', diningFocus: 'Long, leisurely meals at highly-rated local restaurants with advance reservations', activitiesRecommended: JSON.stringify(['Private boat along Amalfi Coast', 'Cooking class in a local home', 'Private Vatican tour', 'Wine tasting in Ravello', 'Sunset dinner at a cliff-top restaurant']), avoidPatterns: JSON.stringify(['Crowded tourist buses', 'Early morning wake-ups', 'Rushed multi-city touring']), advisorNotes: 'Key consideration: This is their honeymoon. Every detail matters. Budget indicates genuine luxury — focus on upgraded experiences and private access. Must-have: "Private boat ride" — prioritize this.', matchingTemplates: JSON.stringify([{ title: 'Romantic Italy', score: 92, reason: 'Strong match for romantic honeymoon in Italy' }, { title: 'Amalfi Coast & Rome', score: 87, reason: 'Shorter but perfectly paced alternative' }]) },
    { leadId: leads[1].id, travelerSummary: 'This couple is seeking a balanced, adventure and scenic travel experience in Iceland. They want to feel "awed by nature" — captured by "Epic." Photography and hiking are central to their trip vision.', idealTripStyle: 'Adventure exploration with Scenic undertones', bestFitDestinations: JSON.stringify([{ destination: 'Iceland', reason: 'Traveler-requested — perfect for adventure and scenery', score: 95 }]), pacingRecommendation: 'Balance structure with flexibility. Mix of guided adventures and free exploration time.', routeSuggestion: 'Ring Road circuit over 8-10 days with focus on South Coast and North Iceland.', hotelStyle: 'Comfortable lodges and countryside hotels with character', diningFocus: 'Local restaurants and farm-to-table experiences', activitiesRecommended: JSON.stringify(['Glacier hiking', 'Northern lights hunting', 'Whale watching', 'Hot spring visits', 'Photography excursions']), avoidPatterns: JSON.stringify(['Too much driving in a single day', 'Missing northern lights opportunities']), advisorNotes: 'Strong match for Iceland Ring Road template. September timing is ideal for northern lights + fall colors. Recommend 4x4 vehicle.', matchingTemplates: JSON.stringify([{ title: 'Iceland Ring Road Adventure', score: 95, reason: 'Perfect match' }]) },
    { leadId: leads[2].id, travelerSummary: 'Family with two teenagers planning a London & Paris trip. Want cultural experiences that engage teens while maintaining educational value. Interested in Harry Potter, food, and shopping.', idealTripStyle: 'Cultural family exploration', bestFitDestinations: JSON.stringify([{ destination: 'London', reason: 'Excellent for teens with Harry Potter, museums, and theatre', score: 92 }, { destination: 'Paris', reason: 'Cultural depth, food experiences, iconic sights', score: 90 }]), pacingRecommendation: 'Family-friendly pace with built-in downtime. Mix of planned activities and free exploration.', routeSuggestion: 'London (4 nights) → Eurostar → Paris (4 nights)', hotelStyle: 'Spacious family rooms in central locations', diningFocus: 'Mix of kid-friendly restaurants and authentic local food experiences', activitiesRecommended: JSON.stringify(['Harry Potter Studio Tour', 'Tower of London', 'West End show', 'Crepe-making class', 'Eiffel Tower', 'Versailles day trip']), avoidPatterns: JSON.stringify(['Over-scheduling', 'Too many museums in one day', 'Long transit times']), advisorNotes: 'Family London + Paris template is a perfect match. Book Harry Potter tour well in advance — sells out months ahead.', matchingTemplates: JSON.stringify([{ title: 'Family Europe: London & Paris', score: 94, reason: 'Designed exactly for this family type' }]) },
    { leadId: leads[3].id, travelerSummary: 'Couple seeking a peaceful, rejuvenating European escape with wellness focus. Open to destination suggestions. Want slow pace and complete decompression from daily life.', idealTripStyle: 'Romantic slow travel with Wellness immersion', bestFitDestinations: JSON.stringify([{ destination: 'Swiss Alps', reason: 'Mountain serenity, world-class spas, scenic beauty', score: 90 }, { destination: 'Santorini', reason: 'Caldera views, slow pace, wellness retreats', score: 85 }, { destination: 'Provence', reason: 'Lavender fields, slow rhythm, vineyard therapy', score: 83 }]), pacingRecommendation: '2-3 nights minimum per location. Prioritize depth, spa days, and unscheduled wandering time.', routeSuggestion: 'Single destination recommended for maximum decompression. Switzerland or Greece preferred.', hotelStyle: 'Spa resorts, wellness retreats, and tranquil countryside estates', diningFocus: 'Slow, leisurely meals at highly-rated restaurants with views', activitiesRecommended: JSON.stringify(['Spa treatments', 'Scenic walks', 'Wine tasting', 'Yoga sessions', 'Nature excursions']), avoidPatterns: JSON.stringify(['Multi-city hopping', 'Early wake-ups', 'Packed schedules']), advisorNotes: 'This couple needs full decompression. Recommend single destination with premium spa hotel. Swiss Alps or Santorini top picks. Budget supports luxury wellness.', matchingTemplates: JSON.stringify([{ title: 'Swiss Alps Scenic Escape', score: 85 }, { title: 'Greek Island Romance', score: 82 }]) },
    { leadId: leads[4].id, travelerSummary: 'Couple celebrating their 10th anniversary with a romantic Greek getaway. Want luxury, romance, and beautiful settings. Santorini is a must-visit.', idealTripStyle: 'Romantic luxury with Scenic elements', bestFitDestinations: JSON.stringify([{ destination: 'Santorini', reason: 'Requested destination — caldera views and romance', score: 95 }, { destination: 'Athens', reason: 'Cultural depth as a complement', score: 80 }]), pacingRecommendation: 'Slow and immersive. Long evenings, late mornings, and sunset-focused activities.', routeSuggestion: 'Athens (2 nights) → Santorini (5-6 nights)', hotelStyle: 'Caldera-view suites, cave hotels, luxury boutiques', diningFocus: 'Fine dining with views, fresh seafood, romantic private dinners', activitiesRecommended: JSON.stringify(['Catamaran sunset cruise', 'Wine tasting in volcanic vineyards', 'Private Acropolis tour', 'Couples spa treatment', 'Oia sunset dinner']), avoidPatterns: JSON.stringify(['Crowded beach clubs', 'Group tours', 'Tight schedules']), advisorNotes: 'Anniversary trip — make it special. Arrange surprise element (champagne at sunset, private dinner). Greek Island Romance template is ideal. Book caldera suite early.', matchingTemplates: JSON.stringify([{ title: 'Greek Island Romance', score: 95 }]) },
    { leadId: leads[5].id, travelerSummary: 'Cultured couple seeking a deep dive into Paris and Provence. Food, wine, and art are central. Want slow pace and indulgent luxury experiences.', idealTripStyle: 'Luxury slow travel with Foodie immersion', bestFitDestinations: JSON.stringify([{ destination: 'Paris', reason: 'Art, culture, Michelin dining', score: 95 }, { destination: 'Provence', reason: 'Wine, lavender, cooking, village life', score: 93 }]), pacingRecommendation: 'Slow and deep. 4 nights Paris, 5-6 nights Provence.', routeSuggestion: 'Paris → TGV → Provence loop', hotelStyle: 'Boutique luxury, palace hotels, Provencal estates', diningFocus: 'Michelin restaurants, local markets, cooking classes, wine estates', activitiesRecommended: JSON.stringify(['Private Louvre tour', 'Cooking class', 'Wine tasting', 'Lavender fields', 'Pont du Gard']), avoidPatterns: JSON.stringify(['Tourist traps', 'Rushed meals', 'Large group tours']), advisorNotes: 'Paris + Provence Slow Luxury template is a near-perfect match. Lavender season (June-July) would be peak timing. This couple appreciates detail — go above and beyond on restaurant reservations.', matchingTemplates: JSON.stringify([{ title: 'Paris & Provence Slow Luxury', score: 97 }]) },
    { leadId: leads[6].id, travelerSummary: 'Active couple looking for Swiss Alps adventure with luxury touches. Want breathtaking views and outdoor activities.', idealTripStyle: 'Scenic adventure with Luxury elements', bestFitDestinations: JSON.stringify([{ destination: 'Switzerland', reason: 'Perfect for scenic mountain experiences', score: 95 }]), pacingRecommendation: 'Moderate pace with a mix of hiking days and scenic train journeys.', routeSuggestion: 'Lucerne → Interlaken → Zermatt', hotelStyle: 'Mountain lodges with panoramic views', diningFocus: 'Alpine dining, fondue experiences, scenic restaurants', activitiesRecommended: JSON.stringify(['Glacier Express', 'Jungfraujoch', 'Lake Lucerne cruise', 'Mountain hiking', 'Chocolate tasting']), avoidPatterns: JSON.stringify(['Sedentary days', 'Overly touristy spots']), advisorNotes: 'Swiss Alps template is the right fit. Aug-Sep timing is ideal for hiking weather. Budget supports premium experiences.', matchingTemplates: JSON.stringify([{ title: 'Swiss Alps Scenic Escape', score: 93 }]) },
    { leadId: leads[7].id, travelerSummary: 'Foodie couple planning a culinary journey through Spain. Barcelona and San Sebastian are must-visits. Want to eat everything.', idealTripStyle: 'Foodie exploration with Cultural depth', bestFitDestinations: JSON.stringify([{ destination: 'Barcelona', reason: 'Gaudi, tapas, markets', score: 95 }, { destination: 'San Sebastian', reason: 'World-class pintxos and dining', score: 93 }]), pacingRecommendation: 'Moderate — allow time between meals! Mix of guided food tours and independent exploration.', routeSuggestion: 'Barcelona (4 nights) → San Sebastian (3 nights) → Madrid (3 nights)', hotelStyle: 'Design hotels near culinary hubs', diningFocus: 'Full culinary immersion — top restaurants, street food, markets, cooking classes', activitiesRecommended: JSON.stringify(['Sagrada Familia', 'La Boqueria tour', 'Pintxos crawl', 'Paella class', 'Flamenco show']), avoidPatterns: JSON.stringify(['Tourist-trap restaurants', 'Missing reservation windows']), advisorNotes: 'Spain Food + Culture template is ideal. This couple is hands-on — they want to approve every restaurant. Book San Sebastian restaurants 60+ days ahead.', matchingTemplates: JSON.stringify([{ title: 'Spain: Barcelona, San Sebastian & Madrid', score: 95 }]) },
    { leadId: leads[8].id, travelerSummary: 'Multi-generational family of 6 planning an Italy trip. Want cultural experiences that work for all ages with a food focus.', idealTripStyle: 'Cultural family travel with Foodie elements', bestFitDestinations: JSON.stringify([{ destination: 'Rome', reason: 'Ancient history for all ages', score: 92 }, { destination: 'Florence', reason: 'Art, food, and beauty', score: 90 }, { destination: 'Amalfi', reason: 'Coastal relaxation for the group', score: 85 }]), pacingRecommendation: 'Moderate pace with rest days. Multi-gen requires flexibility.', routeSuggestion: 'Rome → Florence → Amalfi Coast', hotelStyle: 'Spacious family suites, connecting rooms, properties with multiple amenities', diningFocus: 'Family-friendly restaurants with authentic Italian food', activitiesRecommended: JSON.stringify(['Private Vatican tour', 'Pasta-making class', 'Chianti wine day (adults)', 'Gelato tour', 'Amalfi boat trip']), avoidPatterns: JSON.stringify(['Too many museums', 'Long walks for elderly', 'Late dining times']), advisorNotes: 'Romantic Italy template modified for family. Consider separate activities for adults/kids at times. Accessibility may be needed for grandparents — check mobility.', matchingTemplates: JSON.stringify([{ title: 'Romantic Italy (family modified)', score: 85 }]) },
    { leadId: leads[9].id, travelerSummary: 'Solo adventurer on a moderate budget looking for an exciting short trip. Open to suggestions, wants photography opportunities.', idealTripStyle: 'Adventure discovery', bestFitDestinations: JSON.stringify([{ destination: 'Iceland', reason: 'Perfect for solo adventurers and photographers', score: 88 }, { destination: 'Morocco', reason: 'Budget-friendly adventure with incredible photography', score: 85 }]), pacingRecommendation: 'Fast-paced with efficient routing.', routeSuggestion: 'Iceland South Coast 5-day or Morocco Imperial Cities 7-day', hotelStyle: 'Comfortable lodges and well-located boutique stays', diningFocus: 'Local spots, street food, authentic dining', activitiesRecommended: JSON.stringify(['Photography excursions', 'Hiking', 'Cultural walking tours', 'Market exploration']), avoidPatterns: JSON.stringify(['Luxury splurges beyond budget', 'Too much downtime']), advisorNotes: 'Budget-conscious solo traveler. Iceland or Morocco best fits. Consider shoulder season for better rates.', matchingTemplates: JSON.stringify([{ title: 'Iceland Ring Road (condensed)', score: 80 }]) },
  ]
  for (const s of summaries) {
    await prisma.generatedTravelerSummary.create({ data: s })
  }
  console.log('Created traveler summaries')

  // ==================== TRIP VERSIONS ====================
  const versions = []
  // Lead 0 (Emily - Honeymoon Italy)
  const v1 = await prisma.tripVersion.create({ data: { leadId: leads[0].id, versionNumber: 1, title: 'Romantic Italy: Rome & Amalfi', summary: 'Classic Rome + Amalfi Coast honeymoon with luxury accommodations and private experiences.', destinations: JSON.stringify(['Rome', 'Amalfi Coast']), durationDays: 10, estimatedCost: 14000, itinerary: JSON.stringify([{day:1,title:'Arrive Rome',location:'Rome',description:'Private transfer, evening walk to Trevi Fountain',activities:['Airport transfer','Hotel check-in','Evening passeggiata']},{day:2,title:'Ancient Rome',location:'Rome',description:'Colosseum and Forum private tour, Trastevere dinner',activities:['Colosseum tour','Roman Forum','Trastevere evening']},{day:3,title:'Vatican & Cooking',location:'Rome',description:'Early Vatican access, afternoon pasta class',activities:['Vatican tour','Pasta-making class']},{day:4,title:'To Amalfi',location:'Amalfi Coast',description:'Train to Naples, scenic drive to Positano',activities:['Train','Coastal drive','Beach arrival']},{day:5,title:'Positano Day',location:'Positano',description:'Beach clubs, shopping, cliffside dinner',activities:['Beach morning','Explore Positano','Sunset dinner']},{day:6,title:'Private Boat',location:'Amalfi Coast',description:'Full day private boat along the coast',activities:['Private boat charter','Hidden coves','On-board lunch']},{day:7,title:'Ravello',location:'Ravello',description:'Gardens, concerts, panoramic dinner',activities:['Villa Rufolo','Villa Cimbrone','Sunset dinner']},{day:8,title:'Capri',location:'Capri',description:'Day trip to Capri island',activities:['Blue Grotto','Monte Solaro','Piazzetta lunch']},{day:9,title:'Free Day',location:'Positano',description:'Leisure day: spa, beach, or exploration',activities:['Spa treatment','Beach time','Optional cooking class']},{day:10,title:'Departure',location:'Naples',description:'Transfer to Naples airport',activities:['Farewell breakfast','Airport transfer']}]), hotelIdeas: JSON.stringify([{name:'Hotel de Russie',location:'Rome',description:'5-star luxury near Piazza del Popolo',whyRecommended:'Perfect for honeymooners — romantic garden and excellent service'},{name:'Le Sirenuse',location:'Positano',description:'Iconic Amalfi Coast luxury hotel with sea views',whyRecommended:'The most romantic hotel on the coast'}]), experiences: JSON.stringify([{name:'Private Boat Charter',emoji:'⛵',description:'Full-day private boat along the Amalfi Coast with swimming stops'},{name:'Pasta-Making Class',emoji:'🍝',description:'Learn to make fresh pasta in a local Trastevere kitchen'},{name:'Vatican Early Access',emoji:'🏛️',description:'Private tour before the crowds — Sistine Chapel in near-silence'}]), status: 'finalized' } })
  versions.push(v1)

  const v1b = await prisma.tripVersion.create({ data: { leadId: leads[0].id, versionNumber: 2, title: 'Extended Italy: Rome, Florence & Amalfi', summary: 'Expanded version adding Florence and Tuscany for a more comprehensive Italian experience.', destinations: JSON.stringify(['Rome', 'Florence', 'Amalfi Coast']), durationDays: 14, estimatedCost: 18000, itinerary: JSON.stringify([{day:1,title:'Arrive Rome',location:'Rome'},{day:2,title:'Ancient Rome',location:'Rome'},{day:3,title:'Vatican',location:'Rome'},{day:4,title:'Train to Florence',location:'Florence'},{day:5,title:'Uffizi & Oltrarno',location:'Florence'},{day:6,title:'Tuscan Wine Day',location:'Chianti'},{day:7,title:'Free Day Florence',location:'Florence'},{day:8,title:'To Amalfi',location:'Amalfi Coast'},{day:9,title:'Positano',location:'Positano'},{day:10,title:'Boat Day',location:'Coast'},{day:11,title:'Ravello',location:'Ravello'},{day:12,title:'Capri',location:'Capri'},{day:13,title:'Free Day',location:'Positano'},{day:14,title:'Departure',location:'Naples'}]), hotelIdeas: JSON.stringify([{name:'Hotel de Russie',location:'Rome'},{name:'Portrait Firenze',location:'Florence'},{name:'Le Sirenuse',location:'Positano'}]), experiences: JSON.stringify([{name:'Chianti Wine Tour',emoji:'🍷',description:'Full day in Tuscan wine country'}]), status: 'draft' } })
  versions.push(v1b)

  // Lead 4 (Jessica - Greece Anniversary)
  const v2 = await prisma.tripVersion.create({ data: { leadId: leads[4].id, versionNumber: 1, title: 'Greek Island Romance: Athens & Santorini', summary: '9-day anniversary escape through Athens and Santorini with caldera views and sunset dining.', destinations: JSON.stringify(['Athens', 'Santorini']), durationDays: 9, estimatedCost: 12000, itinerary: JSON.stringify([{day:1,title:'Arrive Athens',location:'Athens'},{day:2,title:'Acropolis & Plaka',location:'Athens'},{day:3,title:'Fly to Santorini',location:'Santorini'},{day:4,title:'Caldera Day',location:'Oia'},{day:5,title:'Wine Tasting',location:'Santorini'},{day:6,title:'Catamaran Cruise',location:'Santorini'},{day:7,title:'Free Day',location:'Santorini'},{day:8,title:'Sunset Dinner',location:'Oia'},{day:9,title:'Departure',location:'Santorini'}]), hotelIdeas: JSON.stringify([{name:'Hotel Grande Bretagne',location:'Athens',description:'Landmark luxury with Acropolis views'},{name:'Canaves Oia Suites',location:'Santorini',description:'Caldera-view infinity pool suites'}]), experiences: JSON.stringify([{name:'Sunset Catamaran',emoji:'⛵',description:'Private catamaran cruise with dinner at sunset'},{name:'Volcanic Wine Tasting',emoji:'🍷',description:'Tour Santorini\'s unique volcanic vineyards'}]), status: 'finalized' } })
  versions.push(v2)

  // Lead 5 (Robert - Paris Provence)
  const v3 = await prisma.tripVersion.create({ data: { leadId: leads[5].id, versionNumber: 1, title: 'Paris & Provence Slow Luxury', summary: '10-day journey from Parisian elegance to Provencal countryside beauty.', destinations: JSON.stringify(['Paris', 'Provence']), durationDays: 10, estimatedCost: 15000, itinerary: JSON.stringify([{day:1,title:'Arrive Paris',location:'Paris'},{day:2,title:'Art & Culture',location:'Paris'},{day:3,title:'Montmartre',location:'Paris'},{day:4,title:'Versailles',location:'Versailles'},{day:5,title:'TGV to Provence',location:'Avignon'},{day:6,title:'Luberon Villages',location:'Luberon'},{day:7,title:'Cooking Class',location:'Aix'},{day:8,title:'Wine Country',location:'Chateauneuf'},{day:9,title:'Cassis',location:'Cassis'},{day:10,title:'Departure',location:'Marseille'}]), hotelIdeas: JSON.stringify([{name:'Le Pavillon de la Reine',location:'Paris'},{name:'La Mirande',location:'Avignon'}]), experiences: JSON.stringify([{name:'Private Louvre Tour',emoji:'🎨',description:'Before-hours access to the Louvre'},{name:'Cooking Class',emoji:'👨‍🍳',description:'Learn Provencal cuisine from a local chef'}]), status: 'finalized' } })
  versions.push(v3)

  // Lead 6 (Amanda - Switzerland - Booked)
  const v4 = await prisma.tripVersion.create({ data: { leadId: leads[6].id, versionNumber: 1, title: 'Swiss Alps Scenic Escape', summary: '7-day journey through Switzerland\'s most dramatic Alpine scenery.', destinations: JSON.stringify(['Lucerne', 'Interlaken', 'Zermatt']), durationDays: 7, estimatedCost: 11000, itinerary: JSON.stringify([{day:1,title:'Arrive Zurich to Lucerne',location:'Lucerne'},{day:2,title:'Lake Lucerne',location:'Lucerne'},{day:3,title:'To Interlaken',location:'Interlaken'},{day:4,title:'Jungfraujoch',location:'Interlaken'},{day:5,title:'Glacier Express',location:'In transit'},{day:6,title:'Matterhorn',location:'Zermatt'},{day:7,title:'Departure',location:'Zurich'}]), hotelIdeas: JSON.stringify([{name:'The Chedi Andermatt',location:'Andermatt'},{name:'Victoria Jungfrau',location:'Interlaken'}]), experiences: JSON.stringify([{name:'Glacier Express',emoji:'🚂',description:'Scenic train through the Alps'}]), status: 'finalized' } })
  versions.push(v4)

  // Lead 7 (James - Spain - Booked)
  const v5 = await prisma.tripVersion.create({ data: { leadId: leads[7].id, versionNumber: 1, title: 'Spain Food & Culture', summary: '11-day culinary journey through Barcelona, San Sebastian, and Madrid.', destinations: JSON.stringify(['Barcelona', 'San Sebastian', 'Madrid']), durationDays: 11, estimatedCost: 8500, itinerary: JSON.stringify([{day:1,title:'Arrive Barcelona',location:'Barcelona'},{day:2,title:'Gaudi Day',location:'Barcelona'},{day:3,title:'La Boqueria',location:'Barcelona'},{day:4,title:'Beach Day',location:'Barcelona'},{day:5,title:'To San Sebastian',location:'San Sebastian'},{day:6,title:'Pintxos Crawl',location:'San Sebastian'},{day:7,title:'Beach & Surf',location:'San Sebastian'},{day:8,title:'To Madrid',location:'Madrid'},{day:9,title:'Prado & Tapas',location:'Madrid'},{day:10,title:'Day Trip',location:'Toledo/Segovia'},{day:11,title:'Departure',location:'Madrid'}]), hotelIdeas: JSON.stringify([{name:'Hotel Arts',location:'Barcelona'},{name:'Maria Cristina',location:'San Sebastian'}]), experiences: JSON.stringify([{name:'Pintxos Crawl',emoji:'🍽️',description:'Guided tour of San Sebastian\'s best pintxos bars'}]), status: 'finalized' } })
  versions.push(v5)

  // More versions for other leads
  const v6 = await prisma.tripVersion.create({ data: { leadId: leads[2].id, versionNumber: 1, title: 'Family London & Paris', summary: '8-day family adventure through London and Paris.', destinations: JSON.stringify(['London', 'Paris']), durationDays: 8, estimatedCost: 7500, itinerary: JSON.stringify([{day:1,title:'Arrive London',location:'London'},{day:2,title:'Tower & Thames',location:'London'},{day:3,title:'Harry Potter',location:'London'},{day:4,title:'West End',location:'London'},{day:5,title:'Eurostar to Paris',location:'Paris'},{day:6,title:'Eiffel & Seine',location:'Paris'},{day:7,title:'Versailles',location:'Paris'},{day:8,title:'Departure',location:'Paris'}]), hotelIdeas: JSON.stringify([{name:'The Langham',location:'London'},{name:'Le Bristol',location:'Paris'}]), experiences: JSON.stringify([{name:'Harry Potter Studio Tour',emoji:'⚡',description:'Full Warner Bros Studio Tour experience'}]), status: 'draft' } })
  versions.push(v6)

  const v7 = await prisma.tripVersion.create({ data: { leadId: leads[1].id, versionNumber: 1, title: 'Iceland Ring Road', summary: '8-day Ring Road adventure with northern lights and glacier hiking.', destinations: JSON.stringify(['Iceland']), durationDays: 8, estimatedCost: 9000, itinerary: JSON.stringify([{day:1,title:'Arrive Reykjavik',location:'Reykjavik'},{day:2,title:'Golden Circle',location:'Golden Circle'},{day:3,title:'South Coast',location:'South Coast'},{day:4,title:'Glacier',location:'Vatnajokull'},{day:5,title:'East Fjords',location:'East Iceland'},{day:6,title:'North',location:'Myvatn'},{day:7,title:'Snaefellsnes',location:'West'},{day:8,title:'Departure',location:'Reykjavik'}]), hotelIdeas: JSON.stringify([{name:'Hotel Ranga',location:'South Iceland'},{name:'Fosshotel Glacier Lagoon',location:'East Iceland'}]), experiences: JSON.stringify([{name:'Glacier Hike',emoji:'🏔️',description:'Guided glacier walk on Solheimajokull'}]), status: 'draft' } })
  versions.push(v7)

  // Versions for lead 3 (open to suggestions - two options)
  const v8 = await prisma.tripVersion.create({ data: { leadId: leads[3].id, versionNumber: 1, title: 'Swiss Wellness Retreat', summary: 'A serene 10-day Swiss wellness escape focused on spas, mountain walks, and rejuvenation.', destinations: JSON.stringify(['Lucerne', 'Gstaad']), durationDays: 10, estimatedCost: 16000, itinerary: JSON.stringify([{day:1,title:'Arrive Zurich',location:'Zurich'},{day:2,title:'Lake Lucerne',location:'Lucerne'},{day:3,title:'Spa Day',location:'Lucerne'},{day:4,title:'Mountain Walk',location:'Rigi'},{day:5,title:'To Gstaad',location:'Gstaad'},{day:6,title:'Alpine Spa',location:'Gstaad'},{day:7,title:'Hiking',location:'Gstaad'},{day:8,title:'Fondue & Rest',location:'Gstaad'},{day:9,title:'Final Spa',location:'Gstaad'},{day:10,title:'Departure',location:'Geneva'}]), hotelIdeas: JSON.stringify([{name:'Burgenstock Resort',location:'Lucerne'},{name:'The Alpina Gstaad',location:'Gstaad'}]), experiences: JSON.stringify([{name:'Alpine Spa Day',emoji:'🧘',description:'Full day at a world-class Swiss spa'}]), status: 'draft' } })
  versions.push(v8)

  const v9 = await prisma.tripVersion.create({ data: { leadId: leads[3].id, versionNumber: 2, title: 'Santorini Serenity', summary: 'An 8-day wellness-focused escape in Santorini with caldera views and spa treatments.', destinations: JSON.stringify(['Santorini']), durationDays: 8, estimatedCost: 12000, itinerary: JSON.stringify([{day:1,title:'Arrive Santorini',location:'Santorini'},{day:2,title:'Caldera Morning',location:'Oia'},{day:3,title:'Spa Day',location:'Fira'},{day:4,title:'Wine Tour',location:'Santorini'},{day:5,title:'Beach Day',location:'Red Beach'},{day:6,title:'Catamaran',location:'Sea'},{day:7,title:'Free Day',location:'Oia'},{day:8,title:'Departure',location:'Santorini'}]), hotelIdeas: JSON.stringify([{name:'Grace Santorini',location:'Imerovigli'}]), experiences: JSON.stringify([{name:'Caldera Yoga',emoji:'🧘',description:'Morning yoga overlooking the caldera'}]), status: 'draft' } })
  versions.push(v9)

  const v10 = await prisma.tripVersion.create({ data: { leadId: leads[12].id, versionNumber: 1, title: 'Christmas Markets: Vienna & Prague', summary: '7-day festive journey through Europe\'s most enchanting Christmas markets.', destinations: JSON.stringify(['Vienna', 'Prague']), durationDays: 7, estimatedCost: 6500, itinerary: JSON.stringify([{day:1,title:'Arrive Vienna',location:'Vienna'},{day:2,title:'Imperial Markets',location:'Vienna'},{day:3,title:'Mozart & Pastries',location:'Vienna'},{day:4,title:'Train to Prague',location:'Prague'},{day:5,title:'Old Town Markets',location:'Prague'},{day:6,title:'Castle & Carols',location:'Prague'},{day:7,title:'Departure',location:'Prague'}]), hotelIdeas: JSON.stringify([{name:'Hotel Sacher',location:'Vienna'},{name:'Four Seasons Prague',location:'Prague'}]), experiences: JSON.stringify([{name:'Horse Carriage Ride',emoji:'🐴',description:'Romantic horse-drawn carriage through Vienna\'s streets'}]), status: 'draft' } })
  versions.push(v10)

  console.log(`Created ${versions.length} trip versions`)

  // ==================== PROPOSALS ====================
  const proposals = []
  const p1 = await prisma.proposal.create({ data: { leadId: leads[0].id, versionId: v1.id, title: 'Romantic Italy Honeymoon: Rome & Amalfi Coast', status: 'SENT', introMessage: 'Dear Emily and your partner, I\'m thrilled to share your personalized honeymoon itinerary. Based on everything you told us about wanting to feel "magical" and "romantic," I\'ve designed a 10-day journey that captures the very best of Italy — from Rome\'s ancient grandeur to the Amalfi Coast\'s sun-kissed cliffs. Every detail has been chosen with your honeymoon in mind.', itinerarySummary: '3 nights in Rome exploring the Colosseum, Vatican, and Trastevere, followed by 6 nights along the Amalfi Coast with private boats, cliffside dining, and a day trip to Capri. The pace is intentionally slow — this is your honeymoon, after all.', pricing: JSON.stringify({ flights_estimate: '$2,000-3,000', accommodation: '$6,000-8,000', experiences: '$2,000-3,000', transfers: '$800-1,200', planning_fee: '$1,000', total_range: '$12,000-16,000' }), inclusions: JSON.stringify(['10 nights luxury accommodation', 'Private airport transfers', 'Private Vatican early-access tour', 'Pasta-making class', 'Full-day private boat charter', 'Capri day trip with Blue Grotto', 'Daily breakfast', 'Dedicated trip support']), exclusions: JSON.stringify(['International flights', 'Travel insurance', 'Most dinners', 'Personal shopping']), advisorSignOff: 'This trip has been designed to feel seamless, romantic, and unforgettable. I genuinely believe it captures everything you described wanting. — Alexandra', sentAt: new Date('2024-11-15') } })
  proposals.push(p1)

  const p2 = await prisma.proposal.create({ data: { leadId: leads[4].id, versionId: v2.id, title: 'Anniversary in Greece: Athens & Santorini', status: 'SENT', introMessage: 'Jessica, happy anniversary! I\'ve put together a 9-day Greek escape designed around romance, relaxation, and celebration. From the Acropolis at dawn to Santorini sunsets, every moment is meant to help you two reconnect and celebrate a decade together.', itinerarySummary: '2 nights in Athens with a private Acropolis tour, then 6 nights in Santorini\'s most romantic caldera-view suite. Highlights include a sunset catamaran cruise, volcanic wine tasting, and a special anniversary dinner in Oia.', pricing: JSON.stringify({ flights_estimate: '$1,500-2,500', accommodation: '$5,000-7,000', experiences: '$1,500-2,000', transfers: '$500-800', planning_fee: '$750', total_range: '$9,500-13,000' }), inclusions: JSON.stringify(['9 nights accommodation', 'Domestic flight Athens-Santorini', 'Private Acropolis tour', 'Sunset catamaran cruise', 'Wine tasting tour', 'Anniversary dinner arrangement', 'Daily breakfast', 'Airport transfers']), exclusions: JSON.stringify(['International flights', 'Travel insurance', 'Most meals']), advisorSignOff: 'Ten years deserves something special. This trip delivers. — Alexandra', sentAt: new Date('2024-11-20'), viewedAt: new Date('2024-11-21') } })
  proposals.push(p2)

  const p3 = await prisma.proposal.create({ data: { leadId: leads[5].id, versionId: v3.id, title: 'Paris & Provence: A Culinary & Cultural Masterpiece', status: 'ACCEPTED', introMessage: 'Robert, your Paris & Provence itinerary is ready. This 10-day journey is designed around your love of food, wine, and culture — with a slow, luxurious pace throughout. From private Louvre tours to lavender fields and Michelin-starred dining, every day builds on the next.', itinerarySummary: '4 nights in Paris with museum tours, fine dining, and a Versailles day trip. Then TGV to Provence for 5 nights exploring Luberon villages, wine country, cooking classes, and the Mediterranean coast.', pricing: JSON.stringify({ flights_estimate: '$2,500-3,500', accommodation: '$7,000-9,000', experiences: '$2,500-3,500', transfers: '$1,000-1,500', planning_fee: '$1,000', total_range: '$13,000-18,000' }), inclusions: JSON.stringify(['10 nights luxury accommodation', 'TGV first-class tickets', 'Private Louvre tour', 'Versailles day trip', 'Provencal cooking class', 'Wine tastings', 'Private driver in Provence', 'Daily breakfast']), exclusions: JSON.stringify(['International flights', 'Travel insurance', 'Most dinners', 'Personal expenses']), advisorSignOff: 'This is one of my favorite itineraries I\'ve ever designed. You\'re going to love every moment. — Alexandra', sentAt: new Date('2024-10-10'), viewedAt: new Date('2024-10-11'), respondedAt: new Date('2024-10-14') } })
  proposals.push(p3)

  const p4 = await prisma.proposal.create({ data: { leadId: leads[6].id, versionId: v4.id, title: 'Swiss Alps: Mountains, Lakes & Railways', status: 'ACCEPTED', introMessage: 'Amanda, your Swiss adventure awaits! 7 days of breathtaking scenery, world-class trains, and mountain luxury.', itinerarySummary: 'From Lucerne\'s lake district through Interlaken\'s adventure capital to Zermatt\'s Matterhorn views. Includes Glacier Express and Jungfraujoch.', pricing: JSON.stringify({ total_range: '$10,000-13,000' }), inclusions: JSON.stringify(['7 nights accommodation', 'Swiss Travel Pass', 'Glacier Express', 'Jungfraujoch excursion', 'Daily breakfast']), exclusions: JSON.stringify(['Flights', 'Insurance', 'Most meals']), advisorSignOff: 'Switzerland will take your breath away — literally. — Alexandra', sentAt: new Date('2024-09-20'), viewedAt: new Date('2024-09-21'), respondedAt: new Date('2024-09-25') } })
  proposals.push(p4)

  const p5 = await prisma.proposal.create({ data: { leadId: leads[7].id, versionId: v5.id, title: 'Spain: A Feast for the Senses', status: 'ACCEPTED', introMessage: 'James, get your appetite ready. This 11-day Spanish odyssey is a culinary adventure from start to finish.', itinerarySummary: 'Barcelona for Gaudi and La Boqueria, San Sebastian for the world\'s best pintxos, Madrid for tapas and the Prado. With cooking classes and market tours throughout.', pricing: JSON.stringify({ total_range: '$7,500-10,000' }), inclusions: JSON.stringify(['11 nights accommodation', 'Domestic trains', 'Guided food tours', 'Cooking class', 'Daily breakfast']), exclusions: JSON.stringify(['Flights', 'Insurance', 'Most meals']), advisorSignOff: 'You\'re going to eat incredibly well. — Alexandra', sentAt: new Date('2024-09-15'), viewedAt: new Date('2024-09-16'), respondedAt: new Date('2024-09-20') } })
  proposals.push(p5)

  const p6 = await prisma.proposal.create({ data: { leadId: leads[2].id, versionId: v6.id, title: 'Family Europe: London & Paris Adventure', status: 'DRAFT', introMessage: 'Sarah, your family\'s European adventure is taking shape! An 8-day journey that balances education with fun.', itinerarySummary: '4 nights in London with Harry Potter, Tower of London, and West End. Then Eurostar to Paris for the Eiffel Tower, Versailles, and crepe-making.', pricing: JSON.stringify({ total_range: '$6,000-9,000' }), inclusions: JSON.stringify(['8 nights family accommodation', 'Eurostar tickets', 'Harry Potter Studio Tour', 'Museum passes', 'Daily breakfast']), exclusions: JSON.stringify(['Flights', 'Insurance', 'Most meals']), advisorSignOff: 'Draft — awaiting family feedback' } })
  proposals.push(p6)

  const p7 = await prisma.proposal.create({ data: { leadId: leads[1].id, versionId: v7.id, title: 'Iceland Ring Road: Fire & Ice Adventure', status: 'DRAFT', introMessage: 'Michael, Iceland is calling. Here\'s your Ring Road adventure.', itinerarySummary: '8-day circuit hitting waterfalls, glaciers, hot springs, and northern lights.', pricing: JSON.stringify({ total_range: '$8,000-11,000' }), inclusions: JSON.stringify(['8 nights accommodation', '4x4 vehicle', 'Glacier hike', 'Blue Lagoon', 'Daily breakfast']), exclusions: JSON.stringify(['Flights', 'Insurance', 'Meals']), advisorSignOff: 'Draft' } })
  proposals.push(p7)

  const p8 = await prisma.proposal.create({ data: { leadId: leads[8].id, title: 'Italy for the Whole Family', status: 'SENT', introMessage: 'Lauren, here\'s a multi-generational Italian experience that will create memories for everyone.', itinerarySummary: 'Rome, Florence, and the Amalfi Coast designed for three generations traveling together.', pricing: JSON.stringify({ total_range: '$15,000-22,000 for group of 6' }), inclusions: JSON.stringify(['Accommodations with connecting rooms', 'Private guides', 'Train tickets', 'Activity bookings', 'Daily breakfast']), exclusions: JSON.stringify(['Flights', 'Insurance', 'Most meals']), advisorSignOff: 'Designed with love for every generation. — Alexandra', sentAt: new Date('2024-08-15') } })
  proposals.push(p8)

  console.log(`Created ${proposals.length} proposals`)

  // ==================== CLIENT PORTAL PAGES ====================
  const portals = [
    { leadId: leads[0].id, proposalId: p1.id, slug: 'emily-honeymoon-italy', title: 'Your Italian Honeymoon', welcomeMessage: 'Emily, we\'re so excited to share your personalized honeymoon itinerary. Every detail has been curated with your "magical" trip feeling in mind. This is your journey — designed around how you actually want to experience Italy.', tripHighlights: JSON.stringify(['Private boat along the Amalfi Coast', 'Vatican early-access tour in near-silence', 'Pasta-making class in Trastevere', 'Cliffside dining in Ravello', 'Day trip to Capri with Blue Grotto']) },
    { leadId: leads[4].id, proposalId: p2.id, slug: 'jessica-anniversary-greece', title: 'Your Anniversary in Greece', welcomeMessage: 'Jessica, happy 10th anniversary! Your Greek escape has been designed around romance, celebration, and the most beautiful sunsets in the world. Every evening in Santorini will remind you why this trip matters.', tripHighlights: JSON.stringify(['Sunset catamaran cruise', 'Caldera-view suite in Oia', 'Volcanic wine tasting', 'Private Acropolis tour at dawn', 'Anniversary dinner under the stars']) },
    { leadId: leads[5].id, proposalId: p3.id, slug: 'robert-paris-provence', title: 'Paris & Provence: Your Culinary Journey', welcomeMessage: 'Robert, your 10-day Paris & Provence itinerary is ready. This trip has been designed around your love of food, wine, and culture — with the slow, luxurious pace you described wanting.', tripHighlights: JSON.stringify(['Private Louvre before-hours tour', 'Michelin-starred dining in Paris', 'Provencal cooking class', 'Wine tasting in Chateauneuf-du-Pape', 'Lavender fields of Luberon']) },
    { leadId: leads[6].id, proposalId: p4.id, slug: 'amanda-swiss-alps', title: 'Your Swiss Alps Adventure', welcomeMessage: 'Amanda, Switzerland is going to take your breath away. Seven days of dramatic Alpine scenery, scenic trains, and mountain luxury await.', tripHighlights: JSON.stringify(['Glacier Express scenic journey', 'Jungfraujoch — Top of Europe', 'Lake Lucerne cruise', 'Matterhorn panoramic views', 'Swiss chocolate tasting']) },
    { leadId: leads[7].id, proposalId: p5.id, slug: 'james-spain-food', title: 'Spain: Your Culinary Adventure', welcomeMessage: 'James, prepare your appetite. 11 days of the best food Spain has to offer — from Barcelona\'s markets to San Sebastian\'s pintxos bars to Madrid\'s legendary tapas scene.', tripHighlights: JSON.stringify(['La Boqueria guided tour', 'Pintxos crawl in San Sebastian', 'Paella cooking class', 'Flamenco show in Madrid', 'Rioja wine region visit']) },
  ]
  for (const p of portals) {
    await prisma.clientPortalPage.create({ data: p })
  }
  console.log('Created portal pages')

  // ==================== LEAD NOTES ====================
  const notes = [
    { leadId: leads[0].id, content: 'Honeymoon couple. Very excited and detail-oriented. Emily mentioned wanting surprise romantic elements. Partner prefers active mornings, relaxed afternoons.', author: 'Alexandra Rivera' },
    { leadId: leads[0].id, content: 'Sent proposal on Nov 15. They loved the boat day idea. Asking about adding a cooking class in Positano.', author: 'Alexandra Rivera' },
    { leadId: leads[1].id, content: 'Michael is a photographer — prioritize golden hour timing for activities. Girlfriend is less outdoorsy, so balance glacier hiking with hot springs.', author: 'Alexandra Rivera' },
    { leadId: leads[2].id, content: 'Family of 4 with two teens (14, 16). Harry Potter Studio Tour is non-negotiable. Both kids are foodies. Budget is moderate.', author: 'Alexandra Rivera' },
    { leadId: leads[4].id, content: 'Anniversary couple. Jessica mentioned wanting a "surprise element." Consider arranging champagne at sunset or a private dinner setup.', author: 'Alexandra Rivera' },
    { leadId: leads[5].id, content: 'Very knowledgeable travelers. Robert has been to Paris twice before. They want deeper experiences, not tourist highlights. Focus on hidden gems.', author: 'Alexandra Rivera' },
    { leadId: leads[6].id, content: 'Amanda booked! Swiss Alps departure confirmed for September. All trains and hotels locked in.', author: 'Alexandra Rivera' },
    { leadId: leads[7].id, content: 'James is a food blogger. He wants to document the entire trip. Booked for October. All restaurant reservations secured.', author: 'Alexandra Rivera' },
  ]
  for (const n of notes) {
    await prisma.leadNote.create({ data: n })
  }
  console.log('Created lead notes')

  // ==================== DESTINATION KNOWLEDGE ====================
  const destKnowledge = [
    // Paris
    { destination: 'Paris', country: 'France', region: 'Western Europe', flagEmoji: '🇫🇷', category: 'GENERAL', title: 'Paris Overview', content: 'The City of Light remains the world\'s most visited city for good reason. Beyond the iconic landmarks, Paris rewards slow exploration — neighborhood cafes, hidden gardens, and local markets tell the real story of this city. Best experienced over 3-5 days minimum.', tags: JSON.stringify(['romantic', 'cultural', 'foodie']), isFeatured: true },
    { destination: 'Paris', country: 'France', region: 'Western Europe', flagEmoji: '🇫🇷', category: 'NEIGHBORHOODS', title: 'Best Paris Neighborhoods', content: 'Le Marais: Best for boutique shopping and falafel. Saint-Germain: Literary cafes and galleries. Montmartre: Artistic charm but touristy. 7th Arr: Eiffel Tower area, elegant and quiet. 1st Arr: Louvre and Tuileries. For staying, Saint-Germain or Le Marais offer the best balance of charm, walkability, and restaurant density.', tags: JSON.stringify(['neighborhoods', 'where to stay']) },
    { destination: 'Paris', country: 'France', region: 'Western Europe', flagEmoji: '🇫🇷', category: 'FOOD_CULTURE', title: 'Paris Dining Guide', content: 'Reserve Michelin restaurants 1-2 months ahead. For authentic bistros, avoid the tourist strips near major monuments. Best bakeries: Du Pain et des Idees, Poilane. Best neighborhood for dinner: Le Marais or Odeon area. Lunch prix fixe menus are the best value in the city. Tip: most locals dine at 8:30pm or later.', tags: JSON.stringify(['restaurants', 'food', 'dining tips']) },
    { destination: 'Paris', country: 'France', region: 'Western Europe', flagEmoji: '🇫🇷', category: 'BEST_TIME_TO_VISIT', title: 'When to Visit Paris', content: 'Peak: June-August (warm, crowded, some locals leave). Shoulder: April-May and September-October (ideal — mild weather, fewer crowds). Winter: November-March (cold but magical for Christmas markets and no queues). Avoid: mid-August when many restaurants close for vacation.', tags: JSON.stringify(['timing', 'seasons']) },
    { destination: 'Paris', country: 'France', region: 'Western Europe', flagEmoji: '🇫🇷', category: 'HIDDEN_GEMS', title: 'Paris Hidden Gems', content: 'Canal Saint-Martin: Local hipster neighborhood with great cafes. Rue Cremieux: Colorful Instagram street. Promenade Plantee: Elevated park that inspired NYC\'s High Line. Musee de l\'Orangerie: Monet\'s Water Lilies in an intimate setting. Covered passages: 19th-century glass-roofed shopping arcades.', tags: JSON.stringify(['hidden gems', 'local tips']) },
    { destination: 'Paris', country: 'France', region: 'Western Europe', flagEmoji: '🇫🇷', category: 'LUXURY_TIPS', title: 'Luxury Paris Tips', content: 'Palace hotels: Le Bristol, The Ritz, Four Seasons George V, Shangri-La. Best for proposals: Jules Verne (Eiffel Tower restaurant). Private shopping: arrange a personal shopper at Galeries Lafayette or Le Bon Marche. Skip Champs-Elysees for shopping — go to Rue du Faubourg Saint-Honore instead.', tags: JSON.stringify(['luxury', 'hotels', 'shopping']) },
    // Iceland
    { destination: 'Iceland', country: 'Iceland', region: 'Nordic', flagEmoji: '🇮🇸', category: 'GENERAL', title: 'Iceland Overview', content: 'A land of fire and ice. Iceland offers some of the most dramatic landscapes on Earth — waterfalls, glaciers, geysers, volcanic beaches, and hot springs. The Ring Road (Route 1) circles the island in about 1,300km. Best for adventure seekers, photographers, and nature lovers.', tags: JSON.stringify(['adventure', 'nature', 'photography']), isFeatured: true },
    { destination: 'Iceland', country: 'Iceland', region: 'Nordic', flagEmoji: '🇮🇸', category: 'BEST_TIME_TO_VISIT', title: 'When to Visit Iceland', content: 'Summer (June-Aug): Midnight sun, green landscapes, all roads open. Best for Ring Road. Winter (Nov-Mar): Northern lights, ice caves, but limited daylight (4-5 hours). Some roads closed. Shoulder (Sep-Oct, Apr-May): Northern lights possible + some daylight. Less crowded. Budget tip: shoulder season is cheapest.', tags: JSON.stringify(['seasons', 'northern lights']) },
    { destination: 'Iceland', country: 'Iceland', region: 'Nordic', flagEmoji: '🇮🇸', category: 'TRANSPORTATION', title: 'Getting Around Iceland', content: 'Rental car is essential outside Reykjavik. 4x4 recommended Oct-Apr and for F-roads (highland roads). Ring Road is well-maintained. Fuel stations can be far apart in the east. No trains in Iceland. Domestic flights connect Reykjavik to Akureyri. Blue Lagoon is near the airport — visit on arrival or departure day.', tags: JSON.stringify(['transportation', 'logistics', 'driving']) },
    { destination: 'Iceland', country: 'Iceland', region: 'Nordic', flagEmoji: '🇮🇸', category: 'HIDDEN_GEMS', title: 'Iceland Hidden Gems', content: 'Seljavallalaug: Hidden swimming pool in a valley. Stokksnes: Dramatic black sand beach with mountain backdrop (better than Reynisfjara for photos). Westfjords: Remote, uncrowded, and absolutely spectacular. Kerlingarfjoll: Colorful geothermal mountains. Hvitserkur: Dragon-shaped rock formation in the north.', tags: JSON.stringify(['hidden gems', 'photography']) },
    { destination: 'Iceland', country: 'Iceland', region: 'Nordic', flagEmoji: '🇮🇸', category: 'ADVENTURE_TIPS', title: 'Iceland Adventure Activities', content: 'Glacier hiking: Solheimajokull or Skaftafell. Always with a certified guide. Ice caving: Only Nov-Mar, book well ahead. Snorkeling Silfra: Visibility up to 100m, water is 2°C (dry suit provided). Whale watching: Husavik is the capital. Horseback riding: Icelandic horses are a unique breed. Northern lights: Best from September to March, away from city light pollution.', tags: JSON.stringify(['activities', 'adventure']) },
    // Italy
    { destination: 'Rome', country: 'Italy', region: 'Southern Europe', flagEmoji: '🇮🇹', category: 'GENERAL', title: 'Rome Overview', content: 'The Eternal City layers 2,700 years of history with vibrant modern life. Beyond the Colosseum and Vatican, Rome\'s neighborhoods each have their own character — Trastevere for dining, Monti for boutique shopping, Testaccio for authentic food. 3-4 days is the minimum to scratch the surface.', tags: JSON.stringify(['cultural', 'historical', 'foodie']), isFeatured: true },
    { destination: 'Rome', country: 'Italy', region: 'Southern Europe', flagEmoji: '🇮🇹', category: 'FOOD_CULTURE', title: 'Rome Dining Guide', content: 'Authentic Roman pasta: cacio e pepe, carbonara, amatriciana, gricia (the "big four"). Best neighborhoods for dinner: Trastevere (touristy but good), Testaccio (local and authentic), Monti (trendy). Reserve at Da Enzo, Roscioli, or Armando al Pantheon. Avoid restaurants with picture menus near major sights.', tags: JSON.stringify(['food', 'restaurants', 'pasta']) },
    { destination: 'Amalfi Coast', country: 'Italy', region: 'Southern Europe', flagEmoji: '🇮🇹', category: 'GENERAL', title: 'Amalfi Coast Overview', content: 'The Amalfi Coast is Italy\'s most dramatic coastline — vertical cliffs dropping into turquoise water, pastel villages clinging to hillsides, and lemon groves everywhere. Positano is the most photogenic town, Ravello has the best views and gardens, Amalfi has the cathedral. Allow 3-5 nights minimum.', tags: JSON.stringify(['romantic', 'scenic', 'luxury']), isFeatured: true },
    { destination: 'Amalfi Coast', country: 'Italy', region: 'Southern Europe', flagEmoji: '🇮🇹', category: 'LUXURY_TIPS', title: 'Amalfi Coast Luxury Guide', content: 'Top hotels: Le Sirenuse (Positano), Il San Pietro (Positano), Hotel Santa Caterina (Amalfi), Belmond Caruso (Ravello). Book private boat charters through your hotel — avoid the crowded public ferries. Best dining: Da Vincenzo (Positano), Rossellinis (Ravello). Path of the Gods hike is spectacular but strenuous.', tags: JSON.stringify(['luxury', 'hotels', 'boats']) },
    { destination: 'Florence', country: 'Italy', region: 'Southern Europe', flagEmoji: '🇮🇹', category: 'GENERAL', title: 'Florence Overview', content: 'The birthplace of the Renaissance. Florence is compact and walkable — the Duomo, Uffizi, Ponte Vecchio, and Palazzo Pitti are all within a 20-minute walk. The Oltrarno (south bank) is the city\'s artisan soul. 2-3 days for the city, plus day trips to Chianti or Siena.', tags: JSON.stringify(['art', 'cultural', 'wine']) },
    // Greece
    { destination: 'Santorini', country: 'Greece', region: 'Mediterranean', flagEmoji: '🇬🇷', category: 'GENERAL', title: 'Santorini Overview', content: 'Santorini is Greece\'s most iconic island — the caldera views, white-washed buildings with blue domes, and spectacular sunsets are world-famous. Oia has the best sunset views, Fira is the main town, and Imerovigli is the quietest caldera village. Allow 4-6 nights for a relaxed visit.', tags: JSON.stringify(['romantic', 'scenic', 'luxury']), isFeatured: true },
    { destination: 'Santorini', country: 'Greece', region: 'Mediterranean', flagEmoji: '🇬🇷', category: 'ROMANCE_TIPS', title: 'Santorini Romance Guide', content: 'Most romantic hotels: Canaves Oia, Grace Santorini (Imerovigli), Katikies. Book caldera-view room — it\'s worth the premium. Best sunset spot: Oia castle (arrive 2 hours early for a spot) or book dinner at Lycabettus restaurant. Private catamaran cruises are the #1 romantic activity. Pro tip: Imerovigli has caldera views without Oia crowds.', tags: JSON.stringify(['romance', 'honeymoon', 'sunset']) },
    { destination: 'Athens', country: 'Greece', region: 'Mediterranean', flagEmoji: '🇬🇷', category: 'GENERAL', title: 'Athens Overview', content: 'Athens is an underrated foodie and cultural destination. The Acropolis anchors the city, but the real magic is in neighborhoods like Plaka, Monastiraki, and Koukaki. Street food is excellent. 2-3 days is enough before island-hopping. Best rooftop bars have Acropolis views.', tags: JSON.stringify(['cultural', 'food', 'history']) },
    // Switzerland
    { destination: 'Switzerland', country: 'Switzerland', region: 'Central Europe', flagEmoji: '🇨🇭', category: 'GENERAL', title: 'Switzerland Overview', content: 'Switzerland is Europe\'s most scenic country. Mountains, lakes, trains, and villages that look like postcards. The Swiss Travel System makes train travel seamless. Key regions: Lucerne (lake country), Interlaken (adventure hub), Zermatt (Matterhorn), Grindelwald (Jungfrau region). Expensive but worth it.', tags: JSON.stringify(['scenic', 'mountains', 'trains']), isFeatured: true },
    { destination: 'Switzerland', country: 'Switzerland', region: 'Central Europe', flagEmoji: '🇨🇭', category: 'TRANSPORTATION', title: 'Swiss Train Travel', content: 'Swiss Travel Pass: Unlimited travel on trains, buses, and boats plus free museum entry. Glacier Express: Zermatt to St. Moritz (8 hours, stunning). GoldenPass: Lucerne to Montreux. Bernina Express: Into Italy via dramatic mountain passes. Book panoramic cars early. Tip: always sit on the right side heading to Zermatt.', tags: JSON.stringify(['trains', 'transportation', 'scenic routes']) },
    // Spain
    { destination: 'Barcelona', country: 'Spain', region: 'Southern Europe', flagEmoji: '🇪🇸', category: 'GENERAL', title: 'Barcelona Overview', content: 'Barcelona combines beach culture with world-class architecture, art, and food. Gaudi\'s masterworks (Sagrada Familia, Park Guell, Casa Batllo) are must-sees. La Boqueria market is a feast for the senses. The Gothic Quarter has history; El Born has trendy restaurants. Allow 3-4 days.', tags: JSON.stringify(['cultural', 'foodie', 'beach', 'architecture']), isFeatured: true },
    { destination: 'Barcelona', country: 'Spain', region: 'Southern Europe', flagEmoji: '🇪🇸', category: 'FOOD_CULTURE', title: 'Barcelona Food Guide', content: 'La Boqueria: Go early morning, avoid lunch rush. For tapas: El Born and Gracia neighborhoods. Top restaurants: Disfrutar (2 Michelin stars), Tickets (playful tapas). Don\'t miss: pan con tomate, patatas bravas, jamon iberico. Cava (sparkling wine) is the local drink. Book popular restaurants 30+ days ahead.', tags: JSON.stringify(['food', 'tapas', 'restaurants']) },
    // Scandinavia
    { destination: 'Copenhagen', country: 'Denmark', region: 'Nordic', flagEmoji: '🇩🇰', category: 'GENERAL', title: 'Copenhagen Overview', content: 'Copenhagen is the capital of hygge and New Nordic cuisine. Nyhavn waterfront, Tivoli Gardens, and the Little Mermaid are the classics. But the real Copenhagen is in neighborhoods like Vesterbro and Norrebro — design shops, craft coffee, and innovative restaurants. Allow 2-3 days.', tags: JSON.stringify(['design', 'foodie', 'hygge']) },
    { destination: 'Norwegian Fjords', country: 'Norway', region: 'Nordic', flagEmoji: '🇳🇴', category: 'GENERAL', title: 'Norwegian Fjords Overview', content: 'Norway\'s fjords are among the most spectacular natural landscapes in the world. Sognefjord is the largest and deepest, Geirangerfjord is the most famous, and Hardangerfjord is surrounded by fruit orchards. The Flam Railway is one of the world\'s most scenic train rides. Best base: Bergen.', tags: JSON.stringify(['nature', 'scenic', 'adventure']) },
    // Christmas Markets
    { destination: 'Vienna', country: 'Austria', region: 'Central Europe', flagEmoji: '🇦🇹', category: 'GENERAL', title: 'Vienna Overview', content: 'Imperial grandeur meets coffeehouse culture. Vienna\'s palaces, opera houses, and museums are world-class. The Christmas market season (mid-Nov to late Dec) transforms the city into a fairytale. Must-visit: Schonbrunn Palace, Musikverein concert hall, Naschmarkt. Allow 3-4 days.', tags: JSON.stringify(['cultural', 'music', 'christmas', 'imperial']), isFeatured: true },
    { destination: 'Vienna', country: 'Austria', region: 'Central Europe', flagEmoji: '🇦🇹', category: 'BEST_TIME_TO_VISIT', title: 'Vienna Christmas Markets', content: 'The Rathaus (City Hall) market is the largest and most famous. Schonbrunn Palace market is more elegant. Spittelberg market is artisanal and charming. Am Hof market is traditional. Markets open mid-November through late December. Weekday evenings are less crowded than weekends. Try: Punsch (mulled punch), Kartoffelpuffer (potato pancakes), Maroni (roasted chestnuts).', tags: JSON.stringify(['christmas', 'markets', 'winter']) },
    // Morocco
    { destination: 'Marrakech', country: 'Morocco', region: 'North Africa', flagEmoji: '🇲🇦', category: 'GENERAL', title: 'Marrakech Overview', content: 'Marrakech assaults the senses — in the best way. The medina is a labyrinth of souks, riads, and food stalls. Jemaa el-Fnaa square comes alive at sunset. Beyond the city, the Atlas Mountains and Sahara Desert are within day-trip range. Best riads are in the medina. Allow 3-4 days.', tags: JSON.stringify(['cultural', 'adventure', 'food']) },
    // Provence
    { destination: 'Provence', country: 'France', region: 'Southern France', flagEmoji: '🇫🇷', category: 'GENERAL', title: 'Provence Overview', content: 'Lavender fields, hilltop villages, Roman ruins, and world-class wine. Provence is southern France at its most beautiful. Key areas: Luberon (villages), Chateauneuf-du-Pape (wine), Avignon (culture), Cassis (coast). Needs a car or private driver. Allow 5-7 days.', tags: JSON.stringify(['wine', 'lavender', 'villages', 'romantic']), isFeatured: true },
    { destination: 'Provence', country: 'France', region: 'Southern France', flagEmoji: '🇫🇷', category: 'BEST_TIME_TO_VISIT', title: 'Provence Seasons', content: 'Lavender: Mid-June to mid-July (Valensole plateau, Senanque Abbey). Rose season: May-June. Grape harvest: September-October. Summer is hot (35°C+) but magical. Spring and fall are ideal for comfortable touring. Winter is quiet — some restaurants close but Christmas markets in Aix are lovely.', tags: JSON.stringify(['lavender', 'seasons', 'wine harvest']) },
    // Maldives
    { destination: 'Maldives', country: 'Maldives', region: 'Indian Ocean', flagEmoji: '🇲🇻', category: 'GENERAL', title: 'Maldives Overview', content: 'The ultimate tropical luxury destination. Over 1,000 coral islands with overwater villas, pristine beaches, and some of the world\'s best diving. Each resort occupies its own island. Transfers from Male by seaplane or speedboat. Allow 5-7 nights minimum for full relaxation.', tags: JSON.stringify(['luxury', 'beach', 'romantic', 'diving']) },
    { destination: 'Maldives', country: 'Maldives', region: 'Indian Ocean', flagEmoji: '🇲🇻', category: 'LUXURY_TIPS', title: 'Maldives Luxury Guide', content: 'Top resorts: Soneva Fushi, One&Only Reethi Rah, St. Regis Maldives, Cheval Blanc Randheli. Overwater villas with direct lagoon access are the signature experience. Book sunset-facing villas. Diving season: year-round, best visibility Jan-Apr. Private sandbank dinners are the ultimate romantic experience.', tags: JSON.stringify(['luxury', 'resorts', 'diving', 'romance']) },
  ]

  const knowledgeEntries = []
  for (const entry of destKnowledge) {
    const created = await prisma.destinationKnowledgeEntry.create({ data: entry })
    knowledgeEntries.push(created)
  }
  console.log(`Created ${knowledgeEntries.length} destination knowledge entries`)

  // ==================== SEASONALITY NOTES ====================
  // Paris seasonality on first Paris entry
  const parisEntry = knowledgeEntries.find(e => e.destination === 'Paris' && e.category === 'BEST_TIME_TO_VISIT')
  if (parisEntry) {
    const parisSeasons = [
      { month: 1, rating: 2, notes: 'Cold but uncrowded. Sales season.', crowds: 'low', weather: 'Cold, 3-7°C, occasional rain' },
      { month: 3, rating: 3, notes: 'Spring beginning. Cherry blossoms start.', crowds: 'low', weather: 'Cool, 8-14°C' },
      { month: 4, rating: 4, notes: 'Lovely spring weather. Easter crowds.', crowds: 'medium', weather: 'Mild, 10-17°C' },
      { month: 5, rating: 5, notes: 'Perfect weather. Gardens in bloom.', crowds: 'medium', weather: 'Warm, 14-20°C' },
      { month: 6, rating: 5, notes: 'Long days, great weather. Pre-summer rush.', crowds: 'high', weather: 'Warm, 17-24°C' },
      { month: 7, rating: 3, notes: 'Hot and crowded. Many locals on vacation.', crowds: 'high', weather: 'Hot, 19-26°C' },
      { month: 9, rating: 5, notes: 'Best month. Perfect weather, locals return.', crowds: 'medium', weather: 'Warm, 16-22°C' },
      { month: 10, rating: 4, notes: 'Beautiful autumn colors. Great for food.', crowds: 'medium', weather: 'Cool, 11-17°C' },
      { month: 12, rating: 4, notes: 'Christmas markets and holiday magic.', crowds: 'high', weather: 'Cold, 3-8°C' },
    ]
    for (const s of parisSeasons) {
      await prisma.seasonalityNote.create({ data: { ...s, destinationId: parisEntry.id } })
    }
  }

  // Iceland seasonality
  const icelandEntry = knowledgeEntries.find(e => e.destination === 'Iceland' && e.category === 'BEST_TIME_TO_VISIT')
  if (icelandEntry) {
    const icelandSeasons = [
      { month: 1, rating: 3, notes: 'Northern lights prime time. Ice caves open.', crowds: 'low', weather: 'Cold, -3 to 2°C, 4-5hr daylight' },
      { month: 2, rating: 4, notes: 'Best month for ice caves and northern lights.', crowds: 'low', weather: 'Cold, -2 to 3°C, increasing daylight' },
      { month: 6, rating: 5, notes: 'Midnight sun. All roads open. Green landscapes.', crowds: 'high', weather: 'Cool, 8-13°C, 24hr daylight' },
      { month: 7, rating: 5, notes: 'Peak summer. Puffins nesting. Best weather.', crowds: 'high', weather: 'Mild, 10-15°C' },
      { month: 8, rating: 5, notes: 'Warm, green. Great for hiking.', crowds: 'high', weather: 'Mild, 9-14°C' },
      { month: 9, rating: 4, notes: 'Northern lights return. Fall colors. Fewer crowds.', crowds: 'medium', weather: 'Cool, 5-10°C' },
    ]
    for (const s of icelandSeasons) {
      await prisma.seasonalityNote.create({ data: { ...s, destinationId: icelandEntry.id } })
    }
  }

  // Santorini seasonality
  const santoriniEntry = knowledgeEntries.find(e => e.destination === 'Santorini' && e.category === 'GENERAL')
  if (santoriniEntry) {
    const santoriniSeasons = [
      { month: 4, rating: 4, notes: 'Spring flowers, quiet island. Some restaurants opening.', crowds: 'low', weather: 'Mild, 15-20°C' },
      { month: 5, rating: 5, notes: 'Perfect — warm, uncrowded, everything open.', crowds: 'medium', weather: 'Warm, 19-24°C' },
      { month: 6, rating: 5, notes: 'Ideal weather. Starting to get busy.', crowds: 'high', weather: 'Hot, 23-28°C' },
      { month: 7, rating: 3, notes: 'Very hot, very crowded. Peak prices.', crowds: 'high', weather: 'Hot, 26-31°C' },
      { month: 9, rating: 5, notes: 'Best month. Warm sea, fewer crowds, great sunsets.', crowds: 'medium', weather: 'Warm, 23-27°C' },
      { month: 10, rating: 4, notes: 'Still warm. Shoulder season pricing. Some closures.', crowds: 'low', weather: 'Mild, 19-23°C' },
    ]
    for (const s of santoriniSeasons) {
      await prisma.seasonalityNote.create({ data: { ...s, destinationId: santoriniEntry.id } })
    }
  }
  console.log('Created seasonality notes')

  // ==================== SAVED PLACES ====================
  const savedPlaces = [
    // Paris Hotels
    { name: 'Hotel Verneuil', destination: 'Paris', country: 'France', flagEmoji: '🇫🇷', category: 'BOUTIQUE_HOTEL', description: 'Intimate Left Bank boutique hotel in a 17th-century building. Just 26 rooms, each uniquely decorated.', priceLevel: 3, rating: 4.7, whyWeRecommend: 'Perfect for couples who want a quintessentially Parisian experience. The rooms feel like a stylish friend\'s apartment.', bestFor: JSON.stringify(['COUPLE', 'HONEYMOON']), tags: JSON.stringify(['romantic', 'boutique', 'left bank']), isTopPick: true },
    { name: 'Le Pavillon de la Reine', destination: 'Paris', country: 'France', flagEmoji: '🇫🇷', category: 'HOTEL', description: 'Hidden behind Place des Vosges in the Marais. A secret garden hotel that feels like a private escape.', priceLevel: 4, rating: 4.8, whyWeRecommend: 'Our top romantic pick in Paris. The secret garden courtyard and Marais location are unbeatable.', bestFor: JSON.stringify(['COUPLE', 'HONEYMOON', 'ANNIVERSARY']), tags: JSON.stringify(['luxury', 'romantic', 'marais']), isTopPick: true, isFeatured: true },
    { name: 'Hotel de Russie', destination: 'Rome', country: 'Italy', flagEmoji: '🇮🇹', category: 'HOTEL', description: 'Rocco Forte hotel between the Spanish Steps and Piazza del Popolo with a stunning terraced garden.', priceLevel: 4, rating: 4.9, whyWeRecommend: 'Best luxury hotel in Rome for location, service, and the secret garden. Perfect for honeymooners.', bestFor: JSON.stringify(['COUPLE', 'HONEYMOON', 'LUXURY']), tags: JSON.stringify(['luxury', 'garden', 'central']), isTopPick: true, isFeatured: true },
    { name: 'Le Sirenuse', destination: 'Positano', country: 'Italy', flagEmoji: '🇮🇹', category: 'HOTEL', description: 'The iconic Amalfi Coast luxury hotel with sea views from every room and impeccable Italian style.', priceLevel: 4, rating: 4.9, whyWeRecommend: 'Simply the most beautiful hotel on the Amalfi Coast. Every room has a sea view. The rooftop restaurant is exceptional.', bestFor: JSON.stringify(['COUPLE', 'HONEYMOON', 'ANNIVERSARY']), tags: JSON.stringify(['luxury', 'iconic', 'sea view']), isTopPick: true, isFeatured: true },
    { name: 'Canaves Oia Suites', destination: 'Santorini', country: 'Greece', flagEmoji: '🇬🇷', category: 'BOUTIQUE_HOTEL', description: 'Cave suites carved into the caldera cliff with infinity pools overlooking the Aegean.', priceLevel: 4, rating: 4.8, whyWeRecommend: 'The caldera views from the infinity pool are iconic Santorini. Perfect for proposals and anniversaries.', bestFor: JSON.stringify(['COUPLE', 'HONEYMOON', 'ANNIVERSARY']), tags: JSON.stringify(['caldera', 'infinity pool', 'romantic']), isTopPick: true },
    { name: 'Hotel Ranga', destination: 'South Iceland', country: 'Iceland', flagEmoji: '🇮🇸', category: 'HOTEL', description: 'Country hotel with hot tubs and an in-house observatory for northern lights viewing.', priceLevel: 3, rating: 4.5, whyWeRecommend: 'Best hotel for northern lights — they have their own observatory and will wake you up when lights appear.', bestFor: JSON.stringify(['COUPLE', 'ADVENTURE']), tags: JSON.stringify(['northern lights', 'countryside', 'hot tubs']), isTopPick: true },
    { name: 'The Chedi Andermatt', destination: 'Andermatt', country: 'Switzerland', flagEmoji: '🇨🇭', category: 'HOTEL', description: 'Ultra-luxury Alpine resort with world-class spa, stunning mountain views, and multiple restaurants.', priceLevel: 4, rating: 4.9, whyWeRecommend: 'The most luxurious mountain hotel in Switzerland. The spa alone is worth the visit.', bestFor: JSON.stringify(['COUPLE', 'WELLNESS', 'LUXURY']), tags: JSON.stringify(['luxury', 'spa', 'mountains', 'ski']), isTopPick: true },
    // Restaurants
    { name: 'Da Enzo al 29', destination: 'Rome', country: 'Italy', flagEmoji: '🇮🇹', category: 'RESTAURANT', description: 'No-frills Trastevere trattoria serving the best cacio e pepe in Rome. Always a queue — arrive by 7pm.', priceLevel: 2, rating: 4.7, whyWeRecommend: 'Authentic Roman cooking at its finest. The cacio e pepe here is legendary. Worth the 30-minute wait.', bestFor: JSON.stringify(['COUPLE', 'FOODIE', 'SOLO']), tags: JSON.stringify(['pasta', 'authentic', 'local favorite']), isTopPick: true },
    { name: 'Le Comptoir du Pantheon', destination: 'Paris', country: 'France', flagEmoji: '🇫🇷', category: 'RESTAURANT', description: 'Classic Parisian bistro near the Pantheon. Great for people-watching and traditional French cuisine.', priceLevel: 3, rating: 4.5, whyWeRecommend: 'Perfect bistro experience — the croque monsieur is perfect, the wine list is excellent, and the terrace is ideal for a leisurely lunch.', bestFor: JSON.stringify(['COUPLE', 'SOLO', 'FOODIE']), tags: JSON.stringify(['bistro', 'french', 'terrace']), isTopPick: false },
    { name: 'Roscioli', destination: 'Rome', country: 'Italy', flagEmoji: '🇮🇹', category: 'RESTAURANT', description: 'Part deli, part wine bar, part restaurant. Famous for carbonara and an exceptional wine list.', priceLevel: 3, rating: 4.8, whyWeRecommend: 'The best carbonara in Rome and a wine list that could keep you busy for hours. Reserve well in advance.', bestFor: JSON.stringify(['COUPLE', 'FOODIE']), tags: JSON.stringify(['wine bar', 'pasta', 'reservations required']), isTopPick: true, isFeatured: true },
    { name: 'Chez Janou', destination: 'Paris', country: 'France', flagEmoji: '🇫🇷', category: 'RESTAURANT', description: 'Romantic Marais restaurant famous for their chocolate mousse. Charming courtyard dining in summer.', priceLevel: 3, rating: 4.6, whyWeRecommend: 'The chocolate mousse is served from a giant bowl — as much as you want. The courtyard is incredibly romantic.', bestFor: JSON.stringify(['COUPLE', 'ROMANTIC']), tags: JSON.stringify(['romantic', 'chocolate mousse', 'marais']), isTopPick: false },
    { name: 'Lycabettus Restaurant', destination: 'Santorini', country: 'Greece', flagEmoji: '🇬🇷', category: 'RESTAURANT', description: 'Fine dining perched on the caldera cliff in Oia with spectacular sunset views.', priceLevel: 4, rating: 4.7, whyWeRecommend: 'Best sunset dinner in Santorini. Book the terrace table for the most romantic experience.', bestFor: JSON.stringify(['COUPLE', 'HONEYMOON', 'ANNIVERSARY']), tags: JSON.stringify(['sunset', 'fine dining', 'romantic']), isTopPick: true },
    // Experiences
    { name: 'Private Vatican Early Access', destination: 'Rome', country: 'Italy', flagEmoji: '🇮🇹', category: 'EXPERIENCE', description: 'Enter the Vatican Museums 90 minutes before the public. Experience the Sistine Chapel in near-silence.', priceLevel: 4, rating: 5.0, whyWeRecommend: 'The only way to see the Sistine Chapel. Standing alone under Michelangelo\'s ceiling is a once-in-a-lifetime moment.', bestFor: JSON.stringify(['COUPLE', 'CULTURAL', 'SOLO']), tags: JSON.stringify(['art', 'exclusive', 'must-do']), isTopPick: true, isFeatured: true },
    { name: 'Private Amalfi Coast Boat Charter', destination: 'Positano', country: 'Italy', flagEmoji: '🇮🇹', category: 'EXPERIENCE', description: 'Full-day private boat along the Amalfi Coast with stops at hidden coves, Amalfi town, and on-board lunch.', priceLevel: 4, rating: 5.0, whyWeRecommend: 'The highlight of every Amalfi trip. Swimming in hidden coves accessible only by boat, with prosecco on deck.', bestFor: JSON.stringify(['COUPLE', 'HONEYMOON']), tags: JSON.stringify(['boat', 'private', 'romantic', 'swimming']), isTopPick: true, isFeatured: true },
    { name: 'Glacier Hiking Solheimajokull', destination: 'South Iceland', country: 'Iceland', flagEmoji: '🇮🇸', category: 'ACTIVITY', description: 'Guided glacier hike on Solheimajokull glacier with crampons and ice axes. No experience required.', priceLevel: 2, rating: 4.8, whyWeRecommend: 'Walking on a glacier is otherworldly. The blue ice formations and panoramic views are extraordinary.', bestFor: JSON.stringify(['ADVENTURE', 'COUPLE', 'SOLO']), tags: JSON.stringify(['glacier', 'hiking', 'adventure']), isTopPick: true },
    { name: 'Blue Lagoon Retreat Spa', destination: 'Reykjavik', country: 'Iceland', flagEmoji: '🇮🇸', category: 'SPA', description: 'The iconic geothermal spa with milky blue water, in-water bar, and luxury retreat facilities.', priceLevel: 4, rating: 4.6, whyWeRecommend: 'Book the Retreat Spa (not basic entry) for a luxury experience. Near the airport — perfect for arrival or departure day.', bestFor: JSON.stringify(['COUPLE', 'WELLNESS']), tags: JSON.stringify(['spa', 'geothermal', 'iconic']), isTopPick: true },
    { name: 'Cooking Class at La Mirande', destination: 'Avignon', country: 'France', flagEmoji: '🇫🇷', category: 'EXPERIENCE', description: 'Learn Provencal cooking in this historic palace hotel kitchen with a professional chef.', priceLevel: 3, rating: 4.9, whyWeRecommend: 'The best cooking class in Provence. You cook in a centuries-old kitchen and eat everything you make.', bestFor: JSON.stringify(['COUPLE', 'FOODIE']), tags: JSON.stringify(['cooking', 'provence', 'culinary']), isTopPick: true },
    { name: 'Santorini Catamaran Sunset Cruise', destination: 'Santorini', country: 'Greece', flagEmoji: '🇬🇷', category: 'EXPERIENCE', description: 'Private catamaran cruise along the caldera with swimming stops, BBQ dinner, and sunset champagne.', priceLevel: 3, rating: 4.9, whyWeRecommend: 'The #1 activity in Santorini. The sunset from the water with champagne in hand is pure magic.', bestFor: JSON.stringify(['COUPLE', 'HONEYMOON']), tags: JSON.stringify(['sailing', 'sunset', 'romantic']), isTopPick: true, isFeatured: true },
    { name: 'Sagrada Familia Private Tour', destination: 'Barcelona', country: 'Spain', flagEmoji: '🇪🇸', category: 'TOUR', description: 'Skip-the-line guided tour of Gaudi\'s masterpiece with tower access and expert art historian guide.', priceLevel: 3, rating: 4.8, whyWeRecommend: 'Gaudi\'s magnum opus deserves an expert guide to decode its symbolism. Tower access is a must for views.', bestFor: JSON.stringify(['COUPLE', 'CULTURAL', 'FAMILY_TEENS']), tags: JSON.stringify(['gaudi', 'architecture', 'must-see']), isTopPick: true },
    { name: 'Jungfraujoch - Top of Europe', destination: 'Interlaken', country: 'Switzerland', flagEmoji: '🇨🇭', category: 'ACTIVITY', description: 'Cogwheel train to Europe\'s highest railway station at 3,454m. Stunning glacier views and ice palace.', priceLevel: 3, rating: 4.7, whyWeRecommend: 'Bucket-list experience. The views from the Sphinx observation deck are breathtaking on clear days.', bestFor: JSON.stringify(['COUPLE', 'FAMILY_TEENS', 'ADVENTURE']), tags: JSON.stringify(['mountains', 'train', 'views']), isTopPick: true },
    { name: 'Harry Potter Studio Tour', destination: 'London', country: 'United Kingdom', flagEmoji: '🇬🇧', category: 'EXPERIENCE', description: 'Warner Bros. Studio Tour London featuring original sets, costumes, and props from the Harry Potter films.', priceLevel: 2, rating: 4.9, whyWeRecommend: 'Essential for families with kids. Even non-fans are impressed by the production quality. Book months ahead.', bestFor: JSON.stringify(['FAMILY_YOUNG_KIDS', 'FAMILY_TEENS']), tags: JSON.stringify(['harry potter', 'family', 'must-book']), isTopPick: true },
    // More restaurants and cafes
    { name: 'Cafe de Flore', destination: 'Paris', country: 'France', flagEmoji: '🇫🇷', category: 'CAFE', description: 'Legendary Saint-Germain cafe where Sartre and de Beauvoir once held court. Classic Parisian experience.', priceLevel: 3, rating: 4.3, whyWeRecommend: 'Order a cafe creme and sit on the terrace. It\'s a tourist spot but a genuine slice of literary Paris history.', bestFor: JSON.stringify(['COUPLE', 'SOLO', 'CULTURAL']), tags: JSON.stringify(['historic', 'terrace', 'literary']) },
    { name: 'La Boqueria Market', destination: 'Barcelona', country: 'Spain', flagEmoji: '🇪🇸', category: 'LANDMARK', description: 'Barcelona\'s famous covered market dating to 1217. A feast for the senses with fresh produce, seafood, and tapas bars.', priceLevel: 2, rating: 4.6, whyWeRecommend: 'Go early morning (before 10am) to avoid the worst crowds. The tapas bars inside are better than most restaurants nearby.', bestFor: JSON.stringify(['FOODIE', 'COUPLE', 'FAMILY_TEENS']), tags: JSON.stringify(['market', 'food', 'must-visit']), isTopPick: true },
    { name: 'Duomo Terrace Tour', destination: 'Florence', country: 'Italy', flagEmoji: '🇮🇹', category: 'EXPERIENCE', description: 'Climb to the terraces of the Florence Cathedral for up-close views of Brunelleschi\'s dome and city panoramas.', priceLevel: 2, rating: 4.8, whyWeRecommend: 'Most tourists do the dome climb — the terrace tour is more exclusive and gives you incredible close-up views of the architecture.', bestFor: JSON.stringify(['COUPLE', 'CULTURAL', 'SOLO']), tags: JSON.stringify(['architecture', 'views', 'exclusive']), isTopPick: false },
    { name: 'Sachertorte at Hotel Sacher', destination: 'Vienna', country: 'Austria', flagEmoji: '🇦🇹', category: 'CAFE', description: 'The original home of the famous Sachertorte chocolate cake. Elegant cafe with old-world Viennese charm.', priceLevel: 3, rating: 4.5, whyWeRecommend: 'You haven\'t been to Vienna until you\'ve had the original Sachertorte in the cafe where it was invented.', bestFor: JSON.stringify(['COUPLE', 'CULTURAL', 'FAMILY_TEENS']), tags: JSON.stringify(['cafe', 'chocolate', 'historic']), isTopPick: true },
    { name: 'Pintxos Crawl - Parte Vieja', destination: 'San Sebastian', country: 'Spain', flagEmoji: '🇪🇸', category: 'EXPERIENCE', description: 'Guided walking tour through the old town\'s best pintxos bars. Sample 8-10 bars with local txakoli wine.', priceLevel: 2, rating: 4.9, whyWeRecommend: 'San Sebastian has more Michelin stars per capita than anywhere else. This crawl hits the best casual spots.', bestFor: JSON.stringify(['COUPLE', 'FOODIE', 'GROUP_FRIENDS']), tags: JSON.stringify(['food tour', 'pintxos', 'wine']), isTopPick: true, isFeatured: true },
    // More hotels
    { name: 'Hotel Borg', destination: 'Reykjavik', country: 'Iceland', flagEmoji: '🇮🇸', category: 'HOTEL', description: 'Art Deco landmark hotel on Reykjavik\'s main square. The city\'s most stylish address.', priceLevel: 3, rating: 4.6, whyWeRecommend: 'Best location in Reykjavik with genuine character. The art deco styling is unique in Iceland.', bestFor: JSON.stringify(['COUPLE', 'SOLO']), tags: JSON.stringify(['art deco', 'central', 'stylish']) },
    { name: 'Fosshotel Glacier Lagoon', destination: 'East Iceland', country: 'Iceland', flagEmoji: '🇮🇸', category: 'HOTEL', description: 'Modern hotel near Jokulsarlon glacier lagoon with floor-to-ceiling windows facing the glaciers.', priceLevel: 3, rating: 4.5, whyWeRecommend: 'Best hotel near the glacier lagoon. Wake up to glacier views. Perfect base for Diamond Beach sunrise.', bestFor: JSON.stringify(['COUPLE', 'ADVENTURE']), tags: JSON.stringify(['glaciers', 'views', 'modern']) },
    { name: 'Portrait Firenze', destination: 'Florence', country: 'Italy', flagEmoji: '🇮🇹', category: 'HOTEL', description: 'Salvatore Ferragamo\'s boutique hotel on the Arno River with Ponte Vecchio views.', priceLevel: 4, rating: 4.8, whyWeRecommend: 'Italian fashion meets Florentine elegance. The river-view suites overlooking Ponte Vecchio are unforgettable.', bestFor: JSON.stringify(['COUPLE', 'HONEYMOON', 'LUXURY']), tags: JSON.stringify(['luxury', 'river view', 'fashion']), isTopPick: true },
    { name: 'Hotel Sacher', destination: 'Vienna', country: 'Austria', flagEmoji: '🇦🇹', category: 'HOTEL', description: 'Vienna\'s most famous hotel, home of the original Sachertorte. Imperial luxury opposite the Opera House.', priceLevel: 4, rating: 4.8, whyWeRecommend: 'Pure Viennese grandeur. The location, history, and afternoon tea experience are unmatched.', bestFor: JSON.stringify(['COUPLE', 'CULTURAL', 'LUXURY']), tags: JSON.stringify(['historic', 'imperial', 'opera']), isTopPick: true },
    { name: 'Grace Santorini', destination: 'Santorini', country: 'Greece', flagEmoji: '🇬🇷', category: 'BOUTIQUE_HOTEL', description: 'Minimalist luxury perched on the caldera in Imerovigli with infinity pool and champagne lounge.', priceLevel: 4, rating: 4.9, whyWeRecommend: 'Quieter than Oia with equally stunning caldera views. The infinity pool is one of the most photographed in Greece.', bestFor: JSON.stringify(['COUPLE', 'HONEYMOON', 'WELLNESS']), tags: JSON.stringify(['caldera', 'minimalist', 'infinity pool']), isTopPick: true },
    { name: 'Victoria Jungfrau', destination: 'Interlaken', country: 'Switzerland', flagEmoji: '🇨🇭', category: 'HOTEL', description: 'Grand Belle Epoque hotel with Jungfrau mountain views, world-class spa, and refined Swiss hospitality.', priceLevel: 4, rating: 4.7, whyWeRecommend: 'The Jungfrau views from the terrace are spectacular. The spa is one of the best in Switzerland.', bestFor: JSON.stringify(['COUPLE', 'LUXURY', 'WELLNESS']), tags: JSON.stringify(['grand hotel', 'spa', 'mountain views']), isTopPick: false },
    // More experiences
    { name: 'Northern Lights Hunt', destination: 'Iceland', country: 'Iceland', flagEmoji: '🇮🇸', category: 'EXPERIENCE', description: 'Expert-guided northern lights chase by super jeep, visiting the best viewing locations away from light pollution.', priceLevel: 3, rating: 4.7, whyWeRecommend: 'The guides know exactly where to go based on real-time solar data. Much better than bus tours.', bestFor: JSON.stringify(['COUPLE', 'ADVENTURE', 'SOLO']), tags: JSON.stringify(['northern lights', 'winter', 'photography']), isTopPick: true },
    { name: 'Chianti Wine Tour', destination: 'Chianti', country: 'Italy', flagEmoji: '🇮🇹', category: 'TOUR', description: 'Full-day private driver tour through Chianti wine country visiting 2-3 estates with tastings and lunch.', priceLevel: 3, rating: 4.8, whyWeRecommend: 'The Tuscan countryside in a private car, stopping at estates that aren\'t in guidebooks. Include olive oil tasting.', bestFor: JSON.stringify(['COUPLE', 'FOODIE']), tags: JSON.stringify(['wine', 'tuscany', 'private driver']), isTopPick: true },
    { name: 'Glacier Express', destination: 'Switzerland', country: 'Switzerland', flagEmoji: '🇨🇭', category: 'EXPERIENCE', description: 'The slowest express train in the world: 8 hours from Zermatt to St. Moritz through 291 bridges and 91 tunnels.', priceLevel: 3, rating: 4.7, whyWeRecommend: 'Not just transport — it\'s one of the world\'s great train journeys. Book panoramic first class and sit on the right side.', bestFor: JSON.stringify(['COUPLE', 'SCENIC', 'FAMILY_TEENS']), tags: JSON.stringify(['train', 'panoramic', 'iconic route']), isTopPick: true, isFeatured: true },
    { name: 'Seine River Cruise', destination: 'Paris', country: 'France', flagEmoji: '🇫🇷', category: 'EXPERIENCE', description: 'Evening cruise along the Seine past illuminated monuments. Private options available with champagne dinner.', priceLevel: 2, rating: 4.5, whyWeRecommend: 'The city looks completely different from the water at night. Spring for the private dinner cruise option.', bestFor: JSON.stringify(['COUPLE', 'ROMANTIC', 'FAMILY_TEENS']), tags: JSON.stringify(['river cruise', 'evening', 'romantic']), isTopPick: false },
    { name: 'Flam Railway', destination: 'Norwegian Fjords', country: 'Norway', flagEmoji: '🇳🇴', category: 'EXPERIENCE', description: 'One of the world\'s steepest railway lines, descending from mountain peaks to the fjord in 20km.', priceLevel: 2, rating: 4.8, whyWeRecommend: 'Spectacular views around every bend. Pair it with a fjord cruise from Flam for the ultimate Norwegian day.', bestFor: JSON.stringify(['COUPLE', 'FAMILY_TEENS', 'SCENIC']), tags: JSON.stringify(['train', 'fjords', 'bucket list']), isTopPick: true },
  ]

  for (const place of savedPlaces) {
    await prisma.savedPlace.create({ data: place })
  }
  console.log(`Created ${savedPlaces.length} saved places`)

  // ==================== PRICING ESTIMATES ====================
  const pricingEstimates = [
    { destination: 'Italy (Rome + Amalfi)', durationDays: 10, travelerType: 'COUPLE', budgetLevel: 'TEN_TO_20K', flightMin: 1500, flightMax: 3000, hotelPerNightMin: 400, hotelPerNightMax: 800, diningPerDayMin: 100, diningPerDayMax: 250, activitiesTotal: 2000, transfersTotal: 800, totalMin: 10000, totalMax: 16000, notes: 'Luxury tier. Le Sirenuse adds ~$1,500/night.' },
    { destination: 'Italy (Rome, Florence, Amalfi)', durationDays: 12, travelerType: 'COUPLE', budgetLevel: 'TEN_TO_20K', flightMin: 1500, flightMax: 3000, hotelPerNightMin: 350, hotelPerNightMax: 700, diningPerDayMin: 100, diningPerDayMax: 200, activitiesTotal: 2500, transfersTotal: 1200, totalMin: 12000, totalMax: 18000, notes: 'Extended Italy route. Train tickets between cities ~$80-150 each.' },
    { destination: 'Iceland Ring Road', durationDays: 8, travelerType: 'COUPLE', budgetLevel: 'FIVE_TO_10K', flightMin: 800, flightMax: 1500, hotelPerNightMin: 200, hotelPerNightMax: 400, diningPerDayMin: 80, diningPerDayMax: 150, activitiesTotal: 1500, transfersTotal: 600, totalMin: 6500, totalMax: 11000, notes: '4x4 rental included in transfers. Food is expensive in Iceland.' },
    { destination: 'Paris & Provence', durationDays: 10, travelerType: 'COUPLE', budgetLevel: 'TEN_TO_20K', flightMin: 1500, flightMax: 2500, hotelPerNightMin: 400, hotelPerNightMax: 700, diningPerDayMin: 100, diningPerDayMax: 300, activitiesTotal: 2000, transfersTotal: 800, totalMin: 11000, totalMax: 17000, notes: 'TGV first class ~$150/person. Private driver in Provence ~$400/day.' },
    { destination: 'Greece (Athens + Santorini)', durationDays: 9, travelerType: 'COUPLE', budgetLevel: 'TEN_TO_20K', flightMin: 1200, flightMax: 2000, hotelPerNightMin: 350, hotelPerNightMax: 800, diningPerDayMin: 80, diningPerDayMax: 200, activitiesTotal: 1500, transfersTotal: 500, totalMin: 8500, totalMax: 14000, notes: 'Caldera-view suites in peak season command premiums. Book early.' },
    { destination: 'Switzerland', durationDays: 7, travelerType: 'COUPLE', budgetLevel: 'TEN_TO_20K', flightMin: 1000, flightMax: 2000, hotelPerNightMin: 300, hotelPerNightMax: 600, diningPerDayMin: 100, diningPerDayMax: 200, activitiesTotal: 1000, transfersTotal: 500, totalMin: 8000, totalMax: 13000, notes: 'Swiss Travel Pass covers most trains. Switzerland is expensive — budget 30% more than comparable European destinations.' },
    { destination: 'London & Paris', durationDays: 9, travelerType: 'COUPLE', budgetLevel: 'FIVE_TO_10K', flightMin: 800, flightMax: 1500, hotelPerNightMin: 200, hotelPerNightMax: 400, diningPerDayMin: 80, diningPerDayMax: 150, activitiesTotal: 800, transfersTotal: 400, totalMin: 5500, totalMax: 9000, notes: 'Eurostar ~$100-200/person. London theatre tickets ~$80-200 each.' },
    { destination: 'Spain (Barcelona + San Sebastian + Madrid)', durationDays: 11, travelerType: 'COUPLE', budgetLevel: 'FIVE_TO_10K', flightMin: 800, flightMax: 1500, hotelPerNightMin: 150, hotelPerNightMax: 350, diningPerDayMin: 60, diningPerDayMax: 150, activitiesTotal: 800, transfersTotal: 500, totalMin: 5000, totalMax: 9000, notes: 'Spain is great value compared to northern Europe. High-speed trains between cities.' },
    { destination: 'Vienna & Munich (Christmas)', durationDays: 7, travelerType: 'COUPLE', budgetLevel: 'FIVE_TO_10K', flightMin: 800, flightMax: 1500, hotelPerNightMin: 200, hotelPerNightMax: 400, diningPerDayMin: 70, diningPerDayMax: 150, activitiesTotal: 600, transfersTotal: 300, totalMin: 5000, totalMax: 8500, notes: 'December accommodation books out early. Markets are free to browse.' },
    { destination: 'Scandinavia (Copenhagen + Norway)', durationDays: 10, travelerType: 'COUPLE', budgetLevel: 'TEN_TO_20K', flightMin: 1000, flightMax: 2000, hotelPerNightMin: 250, hotelPerNightMax: 500, diningPerDayMin: 100, diningPerDayMax: 250, activitiesTotal: 1500, transfersTotal: 800, totalMin: 9000, totalMax: 15000, notes: 'Scandinavian prices are high across the board. Fjord cruises ~$200-400/person.' },
    { destination: 'London & Paris (Family of 4)', durationDays: 8, travelerType: 'FAMILY_TEENS', budgetLevel: 'FIVE_TO_10K', flightMin: 2400, flightMax: 5000, hotelPerNightMin: 300, hotelPerNightMax: 500, diningPerDayMin: 150, diningPerDayMax: 300, activitiesTotal: 1200, transfersTotal: 600, totalMin: 8000, totalMax: 14000, notes: 'Family rooms or connecting rooms required. Harry Potter tour ~$70/person.' },
    { destination: 'Italy (Family of 6)', durationDays: 10, travelerType: 'MULTI_GEN', budgetLevel: 'TEN_TO_20K', flightMin: 4000, flightMax: 8000, hotelPerNightMin: 500, hotelPerNightMax: 1000, diningPerDayMin: 300, diningPerDayMax: 500, activitiesTotal: 3000, transfersTotal: 1500, totalMin: 15000, totalMax: 25000, notes: 'Multi-gen requires flexible accommodations. Private guided tours scale well for groups.' },
    { destination: 'Maldives', durationDays: 7, travelerType: 'HONEYMOON', budgetLevel: 'OVER_20K', flightMin: 2500, flightMax: 4000, hotelPerNightMin: 1500, hotelPerNightMax: 3000, diningPerDayMin: 200, diningPerDayMax: 500, activitiesTotal: 2000, transfersTotal: 800, totalMin: 18000, totalMax: 32000, notes: 'Overwater villa rates vary enormously by resort. Seaplane transfers ~$500/person.' },
    { destination: 'Luxury Paris Weekend', durationDays: 4, travelerType: 'COUPLE', budgetLevel: 'OVER_20K', flightMin: 2000, flightMax: 5000, hotelPerNightMin: 1500, hotelPerNightMax: 3000, diningPerDayMin: 300, diningPerDayMax: 800, activitiesTotal: 3000, transfersTotal: 500, totalMin: 14000, totalMax: 24000, notes: 'Palace hotels: Le Bristol, Ritz, George V. Michelin 3-star dinners ~$300-500/person.' },
    { destination: 'Morocco', durationDays: 7, travelerType: 'COUPLE', budgetLevel: 'THREE_TO_5K', flightMin: 600, flightMax: 1200, hotelPerNightMin: 100, hotelPerNightMax: 250, diningPerDayMin: 30, diningPerDayMax: 80, activitiesTotal: 500, transfersTotal: 400, totalMin: 3000, totalMax: 5500, notes: 'Excellent value destination. Riads offer luxury at a fraction of European prices.' },
  ]
  for (const pe of pricingEstimates) {
    await prisma.pricingEstimate.create({ data: pe })
  }
  console.log(`Created ${pricingEstimates.length} pricing estimates`)

  // ==================== CUSTOMER ACCOUNTS ====================
  const customerPassword = await bcrypt.hash('emily2025', 12)
  const customers = [
    { email: 'emily.watson@example.com', name: 'Emily Watson', leadId: leads[0].id, password: customerPassword },
    { email: 'jessica.martinez@example.com', name: 'Jessica Martinez', leadId: leads[4].id, password: await bcrypt.hash('jessica2025', 12) },
    { email: 'robert.taylor@example.com', name: 'Robert Taylor', leadId: leads[5].id, password: await bcrypt.hash('robert2025', 12) },
    { email: 'amanda.brown@example.com', name: 'Amanda Brown', leadId: leads[6].id, password: await bcrypt.hash('amanda2025', 12) },
    { email: 'james.wilson@example.com', name: 'James Wilson', leadId: leads[7].id, password: await bcrypt.hash('james2025', 12) },
  ]
  for (const c of customers) {
    await prisma.user.create({ data: { ...c, role: 'CLIENT' } })
  }
  console.log('Created customer accounts')

  // ==================== PUBLISH PORTAL PAGES ====================
  // Update existing portal pages to PUBLISHED status
  await prisma.clientPortalPage.updateMany({
    data: { portalStatus: 'PUBLISHED', publishedAt: new Date(), advisorMessage: 'I\'ve put this trip together personally for you. Take your time reviewing everything, and don\'t hesitate to reach out with questions or changes. This is your trip — we\'ll make it perfect.' },
  })
  console.log('Published portal pages')

  // ==================== CHECKLIST TEMPLATES ====================
  const clTemplates = [
    {
      name: 'International Trip Prep',
      description: 'Standard pre-trip checklist for international travel',
      category: 'PRE_TRIP',
      isDefault: true,
      items: JSON.stringify([
        { title: 'Passport valid for 6+ months', category: 'PRE_TRIP' },
        { title: 'Visa requirements checked', category: 'PRE_TRIP' },
        { title: 'Travel insurance purchased', category: 'PRE_TRIP' },
        { title: 'Flights booked and confirmed', category: 'PRE_TRIP' },
        { title: 'Hotels booked and confirmed', category: 'PRE_TRIP' },
        { title: 'Credit card company notified of travel', category: 'PRE_TRIP' },
        { title: 'Phone international plan activated', category: 'PRE_TRIP' },
        { title: 'Copies of documents saved digitally', category: 'PRE_TRIP' },
        { title: 'Packing complete', category: 'PRE_TRIP' },
        { title: 'Home preparations done (mail, plants, etc.)', category: 'PRE_TRIP' },
      ]),
    },
    {
      name: 'Honeymoon Travel Prep',
      description: 'Pre-trip checklist for honeymoon couples',
      category: 'PRE_TRIP',
      items: JSON.stringify([
        { title: 'Passports valid and name changes processed', category: 'PRE_TRIP' },
        { title: 'Travel insurance for both travelers', category: 'PRE_TRIP' },
        { title: 'Special occasion noted with hotel', category: 'PRE_TRIP' },
        { title: 'Restaurant reservations confirmed', category: 'PRE_TRIP' },
        { title: 'Spa bookings confirmed', category: 'PRE_TRIP' },
        { title: 'Wedding ring insurance', category: 'PRE_TRIP' },
        { title: 'Out-of-office replies set', category: 'PRE_TRIP' },
        { title: 'Currency / payment cards ready', category: 'PRE_TRIP' },
      ]),
    },
    {
      name: 'Europe City Trip',
      description: 'Checklist for European city-hopping trips',
      category: 'PRE_TRIP',
      items: JSON.stringify([
        { title: 'EU entry requirements verified', category: 'PRE_TRIP' },
        { title: 'Train tickets / passes purchased', category: 'PRE_TRIP' },
        { title: 'Museum reservations booked', category: 'PRE_TRIP' },
        { title: 'Walking shoes packed', category: 'PRE_TRIP' },
        { title: 'Power adapter packed (EU type)', category: 'PRE_TRIP' },
        { title: 'Offline maps downloaded', category: 'PRE_TRIP' },
        { title: 'Restaurant reservations confirmed', category: 'PRE_TRIP' },
      ]),
    },
    {
      name: 'Family Travel Prep',
      description: 'Pre-trip checklist for traveling with children',
      category: 'PRE_TRIP',
      items: JSON.stringify([
        { title: 'All passports valid', category: 'PRE_TRIP' },
        { title: 'Child travel consent letters (if needed)', category: 'PRE_TRIP' },
        { title: 'Kids activities and entertainment packed', category: 'PRE_TRIP' },
        { title: 'Snacks and comfort items ready', category: 'PRE_TRIP' },
        { title: 'Family travel insurance confirmed', category: 'PRE_TRIP' },
        { title: 'Child-friendly restaurants researched', category: 'PRE_TRIP' },
        { title: 'Car seats / strollers arranged', category: 'PRE_TRIP' },
      ]),
    },
  ]
  for (const t of clTemplates) {
    await prisma.checklistTemplate.create({ data: t })
  }
  console.log('Created checklist templates')

  // ==================== CHECKLIST ITEMS FOR DEMO PORTALS ====================
  const allPortals = await prisma.clientPortalPage.findMany()
  for (const portal of allPortals) {
    // Pre-trip items
    const preTripItems = [
      { title: 'Passport verified and valid', category: 'PRE_TRIP', sortOrder: 0 },
      { title: 'Travel insurance purchased', category: 'PRE_TRIP', sortOrder: 1 },
      { title: 'Flights confirmed', category: 'PRE_TRIP', sortOrder: 2 },
      { title: 'Hotels confirmed', category: 'PRE_TRIP', sortOrder: 3 },
      { title: 'Packing complete', category: 'PRE_TRIP', sortOrder: 4 },
    ]
    for (const item of preTripItems) {
      await prisma.checklistItem.create({
        data: { ...item, portalId: portal.id, isCustomerVisible: true },
      })
    }

    // Day activity items (sample)
    const dayItems = [
      { title: 'Airport transfer', category: 'DAY_ACTIVITY', dayNumber: 1, sortOrder: 10 },
      { title: 'Hotel check-in', category: 'DAY_ACTIVITY', dayNumber: 1, sortOrder: 11 },
      { title: 'Welcome dinner', category: 'DAY_ACTIVITY', dayNumber: 1, sortOrder: 12 },
      { title: 'Morning guided tour', category: 'DAY_ACTIVITY', dayNumber: 2, sortOrder: 13 },
      { title: 'Lunch reservation', category: 'DAY_ACTIVITY', dayNumber: 2, sortOrder: 14 },
      { title: 'Afternoon exploration', category: 'DAY_ACTIVITY', dayNumber: 2, sortOrder: 15 },
      { title: 'Special experience', category: 'DAY_ACTIVITY', dayNumber: 3, sortOrder: 16 },
    ]
    for (const item of dayItems) {
      await prisma.checklistItem.create({
        data: { ...item, portalId: portal.id, isCustomerVisible: true },
      })
    }
  }

  // Mark some items as completed for first portal (Emily's)
  const emilyUser = await prisma.user.findFirst({ where: { email: 'emily.watson@example.com' } })
  const emilyPortal = allPortals[0]
  if (emilyUser && emilyPortal) {
    const emilyItems = await prisma.checklistItem.findMany({
      where: { portalId: emilyPortal.id },
      orderBy: { sortOrder: 'asc' },
      take: 5,
    })
    for (const item of emilyItems.slice(0, 3)) {
      await prisma.checklistCompletion.create({
        data: { itemId: item.id, userId: emilyUser.id, completed: true },
      })
    }
  }
  console.log('Created checklist items with demo completions')

  console.log('\n✅ Seed complete! Database populated with demo data.')
  console.log('Admin login: admin@voyagr.com / voyagr2024')
  console.log('Customer logins:')
  console.log('  emily.watson@example.com / emily2025')
  console.log('  jessica.martinez@example.com / jessica2025')
  console.log('  robert.taylor@example.com / robert2025')
  console.log('  amanda.brown@example.com / amanda2025')
  console.log('  james.wilson@example.com / james2025')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
