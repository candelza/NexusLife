-- Insert sample bible verses for Faith Nexus Hub
-- Database password: :hNOV8LYxzsAm8uKN

-- Insert sample bible verses
INSERT INTO public.bible_verses (
  id,
  book,
  chapter,
  verse_start,
  verse_end,
  content,
  content_thai,
  explanation,
  explanation_thai,
  reading_day,
  created_at,
  updated_at
) VALUES 
(
  'verse-001',
  'สดุดี',
  23,
  1,
  6,
  'The LORD is my shepherd, I shall not want. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name\'s sake. Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me. You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows. Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the LORD forever.',
  'พระยาห์เวห์ทรงเป็นผู้เลี้ยงของข้าพเจ้า ข้าพเจ้าจะไม่ขัดสน พระองค์ทรงให้ข้าพเจ้าอยู่ในทุ่งหญ้าเขียว พระองค์ทรงนำข้าพเจ้าไปยังน้ำที่สงบ พระองค์ทรงฟื้นฟูจิตวิญญาณของข้าพเจ้า พระองค์ทรงนำข้าพเจ้าไปในทางแห่งความชอบธรรม เพื่อเห็นแก่พระนามของพระองค์ แม้ว่าข้าพเจ้าจะเดินผ่านหุบเขาที่มืดมิด ข้าพเจ้าจะไม่กลัวอันตรายใดๆ เพราะพระองค์ทรงอยู่กับข้าพเจ้า ไม้เท้าและไม้ค้ำของพระองค์ทำให้ข้าพเจ้าสบายใจ พระองค์ทรงจัดโต๊ะไว้ให้ข้าพเจ้าในที่ที่มีศัตรูของข้าพเจ้า พระองค์ทรงเจิมศีรษะของข้าพเจ้าด้วยน้ำมัน ถ้วยของข้าพเจ้าเต็มล้น แน่นอนความดีและความรักของพระองค์จะติดตามข้าพเจ้าตลอดชีวิตของข้าพเจ้า และข้าพเจ้าจะอยู่ในพระนิเวศของพระยาห์เวห์ตลอดไป',
  'This psalm describes God as a caring shepherd who provides, protects, and guides His people through all circumstances of life.',
  'สดุดีบทนี้บรรยายพระเจ้าว่าเป็นผู้เลี้ยงที่เอาใจใส่ ผู้ทรงจัดหา ปกป้อง และนำทางประชากรของพระองค์ผ่านทุกสถานการณ์ในชีวิต',
  1,
  NOW(),
  NOW()
),
(
  'verse-002',
  'ยอห์น',
  3,
  16,
  16,
  'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
  'เพราะว่าพระเจ้าทรงรักโลก จนได้ทรงประทานพระบุตรองค์เดียวของพระองค์ เพื่อผู้ที่เชื่อในพระบุตรนั้นจะไม่พินาศ แต่มีชีวิตนิรันดร์',
  'This is the most famous verse in the Bible, summarizing the gospel message of God\'s love and salvation through Jesus Christ.',
  'นี่เป็นข้อพระคัมภีร์ที่มีชื่อเสียงที่สุดในพระคัมภีร์ สรุปสารแห่งข่าวประเสริฐของความรักและการช่วยให้รอดของพระเจ้าผ่านพระเยซูคริสต์',
  2,
  NOW(),
  NOW()
),
(
  'verse-003',
  'ฟิลิปปี',
  4,
  6,
  7,
  'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
  'อย่ากระวนกระวายในสิ่งใดเลย แต่จงทูลเรื่องราวของท่านต่อพระเจ้าในทุกกรณี โดยการอธิษฐาน การวิงวอน และการขอบพระคุณ และสันติสุขของพระเจ้าซึ่งเกินความเข้าใจ จะคุ้มครองจิตใจและความคิดของท่านในพระเยซูคริสต์',
  'This verse teaches us to replace anxiety with prayer and thanksgiving, promising God\'s peace in return.',
  'ข้อนี้สอนให้เราแทนที่ความกังวลด้วยการอธิษฐานและการขอบพระคุณ และสัญญาสันติสุขของพระเจ้าเป็นการตอบแทน',
  3,
  NOW(),
  NOW()
),
(
  'verse-004',
  'มัทธิว',
  28,
  19,
  20,
  'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.',
  'เพราะฉะนั้นท่านทั้งหลายจงไปและนำชนทุกชาติมาเป็นสาวก ให้พวกเขาเป็นลูกของพระองค์โดยการรับบัพติศมาในพระนามของพระบิดา พระบุตร และพระวิญญาณบริสุทธิ์ และสอนพวกเขาให้ถือรักษาสิ่งสารพัดที่เราสั่งพวกท่านไว้ และนี่แน่ะ เราจะอยู่กับท่านทั้งหลายเสมอไป จนกว่าจะสิ้นยุค',
  'This is the Great Commission, Jesus\' final command to His disciples to spread the gospel and make disciples worldwide.',
  'นี่คือพระบัญชาสูงสุด พระบัญชาสุดท้ายของพระเยซูต่อสาวกของพระองค์ให้แพร่ข่าวประเสริฐและสร้างสาวกทั่วโลก',
  4,
  NOW(),
  NOW()
),
(
  'verse-005',
  'โรม',
  8,
  28,
  28,
  'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
  'และเรารู้ว่าในทุกสิ่ง พระเจ้าทรงช่วยคนที่รักพระองค์ให้เกิดผลดี คือคนทั้งปวงที่พระองค์ได้ทรงเรียกตามพระประสงค์ของพระองค์',
  'This verse assures believers that God works all things together for good for those who love Him and are called according to His purpose.',
  'ข้อนี้ให้ความมั่นใจแก่ผู้เชื่อว่าพระเจ้าทรงทำให้ทุกสิ่งทำงานร่วมกันเพื่อความดีสำหรับผู้ที่รักพระองค์และได้รับการเรียกตามพระประสงค์ของพระองค์',
  5,
  NOW(),
  NOW()
),
(
  'verse-006',
  'สุภาษิต',
  3,
  5,
  6,
  'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
  'จงวางใจในพระยาห์เวห์ด้วยสุดใจของท่าน และอย่าอาศัยความเข้าใจของตนเอง จงยอมรับรู้พระองค์ในทุกทางของท่าน และพระองค์จะทรงกระทำให้วิถีของท่านตรง',
  'This verse teaches us to trust God completely and acknowledge Him in all our ways, promising that He will direct our paths.',
  'ข้อนี้สอนให้เราไว้วางใจพระเจ้าอย่างสมบูรณ์และยอมรับรู้พระองค์ในทุกทางของเรา สัญญาว่าพระองค์จะทรงนำทางเรา',
  6,
  NOW(),
  NOW()
),
(
  'verse-007',
  'อิสยาห์',
  40,
  31,
  31,
  'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
  'แต่คนที่รอคอยพระยาห์เวห์จะได้กำลังใหม่ เขาจะบินขึ้นด้วยปีกเหมือนนกอินทรี เขาจะวิ่งและไม่เหนื่อย เขาจะเดินและไม่อ่อนเปลี้ย',
  'This verse promises renewed strength to those who wait on the LORD, comparing them to eagles soaring in the sky.',
  'ข้อนี้สัญญากำลังใหม่แก่ผู้ที่รอคอยพระยาห์เวห์ เปรียบเทียบพวกเขาเหมือนนกอินทรีที่บินในท้องฟ้า',
  7,
  NOW(),
  NOW()
),
(
  'verse-008',
  '2 ทิโมธี',
  1,
  7,
  7,
  'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
  'เพราะว่าพระเจ้าทรงประทานพระวิญญาณให้เราไม่ใช่พระวิญญาณแห่งความขลาด แต่เป็นพระวิญญาณแห่งฤทธานุภาพ ความรัก และการควบคุมตนเอง',
  'This verse reminds us that God has given us a spirit of power, love, and self-discipline, not fear.',
  'ข้อนี้เตือนใจเราว่าพระเจ้าทรงประทานพระวิญญาณแห่งฤทธานุภาพ ความรัก และการควบคุมตนเองให้เรา ไม่ใช่ความกลัว',
  8,
  NOW(),
  NOW()
),
(
  'verse-009',
  'ยากอบ',
  1,
  5,
  5,
  'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
  'ถ้าผู้ใดในพวกท่านขาดสติปัญญา ก็ให้ผู้นั้นทูลขอจากพระเจ้าผู้ทรงประทานให้แก่ทุกคนอย่างไม่ถือโทษ และจะทรงประทานให้แก่ผู้นั้น',
  'This verse encourages us to ask God for wisdom when we need it, promising that He will give it generously.',
  'ข้อนี้สนับสนุนให้เราขอสติปัญญาจากพระเจ้าเมื่อเราต้องการ สัญญาว่าพระองค์จะทรงประทานให้อย่างไม่ถือโทษ',
  9,
  NOW(),
  NOW()
),
(
  'verse-010',
  '1 เปโตร',
  5,
  7,
  7,
  'Cast all your anxiety on him because he cares for you.',
  'จงมอบความกังวลของท่านทั้งหลายให้พระองค์ เพราะพระองค์ทรงห่วงใยท่าน',
  'This verse invites us to cast all our cares on God because He cares for us.',
  'ข้อนี้เชิญให้เรามอบความกังวลทั้งหมดของเราให้พระเจ้าเพราะพระองค์ทรงห่วงใยเรา',
  10,
  NOW(),
  NOW()
);

-- Display the inserted verses
SELECT 
  id,
  book,
  chapter,
  verse_start,
  verse_end,
  reading_day,
  created_at
FROM public.bible_verses 
WHERE id LIKE 'verse-%'
ORDER BY reading_day ASC;
