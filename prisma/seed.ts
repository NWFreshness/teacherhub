import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const curricula = [
  {
    title: 'Mathematics Grade 6 - Algebra Basics',
    description: 'Introduction to algebraic expressions, variables, and simple equations aligned with Washington State Common Core Standards for 6th Grade Mathematics.',
    subject: 'Math',
    gradeLevel: '6',
    isPublic: true,
    content: JSON.stringify({
      standards: ['CCSS.MATH.CONTENT.6.EE.A.1', 'CCSS.MATH.CONTENT.6.EE.A.2', 'CCSS.MATH.CONTENT.6.EE.B.5'],
      topics: [
        {
          name: 'Understanding Variables',
          content: 'Variables are symbols that represent unknown values in mathematical expressions. In algebra, we use letters like x, y, or n to represent these unknowns. For example, in the expression x + 5 = 10, x is the variable.',
          keyPoints: ['Variables represent unknown values', 'Letters are used as variables', 'Variables can be solved for']
        },
        {
          name: 'Writing Algebraic Expressions',
          content: 'Algebraic expressions combine numbers, variables, and operations. For example, "the sum of a number and 5" can be written as n + 5 or x + 5. "Twice a number" would be 2n or 2x.',
          keyPoints: ['Operations translate to + - × ÷', 'Phrases map to expressions', 'Practice with word problems']
        },
        {
          name: 'Solving Simple Equations',
          content: 'An equation is a mathematical statement that shows two expressions are equal. To solve for the variable, we perform the same operation on both sides to isolate the variable.',
          keyPoints: ['Equations use = sign', 'Inverse operations solve equations', 'Check solutions by substituting']
        }
      ],
      assessments: ['Quiz on variables', 'Chapter test on expressions', 'Problem solving worksheet']
    })
  },
  {
    title: 'Science Grade 4 - Earth Science',
    description: 'Exploring Earth\'s features, rocks, minerals, and natural processes aligned with Oregon State Science Standards for 4th Grade.',
    subject: 'Science',
    gradeLevel: '4',
    isPublic: true,
    content: JSON.stringify({
      standards: ['NGSS.4.ESS1.1', 'NGSS.4.ESS2.1', 'NGSS.4.ESS2.2'],
      topics: [
        {
          name: 'Earth\'s Surface Features',
          content: 'Earth\'s surface is constantly changing through natural processes like weathering, erosion, and deposition. Weathering breaks rocks into smaller pieces, erosion moves those pieces, and deposition deposits them in new locations.',
          keyPoints: ['Weathering breaks down rocks', 'Erosion moves materials', 'Deposition creates new landforms']
        },
        {
          name: 'Rocks and Minerals',
          content: 'Rocks are made of minerals. There are three main types of rocks: igneous (formed from cooled lava/magma), sedimentary (formed from compacted sediments), and metamorphic (changed by heat and pressure).',
          keyPoints: ['Rocks contain minerals', 'Three rock types', 'Rock cycle explains transformations']
        },
        {
          name: 'Earthquakes and Volcanoes',
          content: 'Earth\'s crust is made of tectonic plates that move. When these plates shift, they can cause earthquakes or volcanic eruptions. Earthquakes happen when plates grind or snap. Volcanoes form when magma erupts through Earth\'s surface.',
          keyPoints: ['Tectonic plates cause earthquakes', 'Volcanoes erupt magma', 'Both shape Earth\'s surface']
        }
      ],
      assessments: ['Rock collection project', 'Volcano model demonstration', 'Unit test on Earth processes']
    })
  },
  {
    title: 'ELA Grade 8 - Literary Analysis',
    description: 'Developing skills in analyzing literature, identifying themes, and interpreting author\'s purpose aligned with Washington State ELA Common Core Standards.',
    subject: 'ELA',
    gradeLevel: '8',
    isPublic: true,
    content: JSON.stringify({
      standards: ['CCSS.ELA-LITERACY.RL.8.1', 'CCSS.ELA-LITERACY.RL.8.2', 'CCSS.ELA-LITERACY.RL.8.3'],
      topics: [
        {
          name: 'Theme and Central Idea',
          content: 'The theme is the underlying message or lesson in a literary work. The central idea is what the text is mainly about. Themes are often implied rather than explicitly stated, and readers must infer them from characters, plot, and settings.',
          keyPoints: ['Theme is the message', 'Central idea is the main point', 'Both require inference']
        },
        {
          name: 'Author\'s Purpose',
          content: 'Authors write for different purposes: to entertain, inform, persuade, or explain. Recognizing the author\'s purpose helps readers understand the text more deeply and appreciate the author\'s choices.',
          keyPoints: ['PIE: Persuade, Inform, Entertain', 'Techniques reveal purpose', 'Multiple purposes possible']
        },
        {
          name: 'Character Analysis',
          content: 'Characters drive the story. Static characters stay the same, while dynamic characters change. We analyze characters by looking at their actions, dialogue, thoughts, and relationships with other characters.',
          keyPoints: ['Static vs dynamic characters', 'Character motivation', 'Analyze through evidence']
        }
      ],
      assessments: ['Theme analysis essay', 'Book club discussions', 'Author purpose presentation']
    })
  },
  {
    title: 'Social Studies Grade 5 - Ancient Civilizations',
    description: 'Study of ancient civilizations including Mesopotamia, Egypt, Greece, and Rome aligned with Oregon Social Science Standards.',
    subject: 'Social Studies',
    gradeLevel: '5',
    isPublic: true,
    content: JSON.stringify({
      standards: ['OR.SS.05.01', 'OR.SS.05.02', 'OR.SS.05.03'],
      topics: [
        {
          name: 'Ancient Mesopotamia',
          content: 'Mesopotamia, "the land between rivers," is called the cradle of civilization. Located between the Tigris and Euphrates rivers, it was home to Sumer, Babylon, and Assyria. The Sumerians invented writing (cuneiform), the wheel, and the 60-second minute.',
          keyPoints: ['Location: Tigris-Euphrates', 'Inventions: writing, wheel', 'City-states: Ur, Babylon']
        },
        {
          name: 'Ancient Egypt',
          content: 'Ancient Egypt flourished along the Nile River for over 3,000 years. Known for pyramids, pharaohs, and hieroglyphics, Egyptian civilization developed advanced systems of government, writing, and architecture. The Nile\'s annual flooding supported agriculture.',
          keyPoints: ['Nile River civilization', 'Pyramids and pharaohs', 'Hieroglyphic writing']
        },
        {
          name: 'Ancient Greece',
          content: 'Ancient Greece laid the foundation for Western civilization. Greek city-states like Athens and Sparta developed democracy, philosophy, theater, and the Olympic Games. Greek architecture and art influenced cultures for millennia.',
          keyPoints: ['Athens: democracy', 'Sparta: military', 'Philosophy: Socrates, Plato, Aristotle']
        }
      ],
      assessments: ['Civilization comparison chart', 'Museum exhibit project', 'Greek democracy debate']
    })
  },
  {
    title: 'Mathematics Grade 3 - Fractions',
    description: 'Introduction to fractions, comparing fractions, and fraction operations aligned with Washington State Common Core Standards for 3rd Grade Mathematics.',
    subject: 'Math',
    gradeLevel: '3',
    isPublic: true,
    content: JSON.stringify({
      standards: ['CCSS.MATH.CONTENT.3.NF.A.1', 'CCSS.MATH.CONTENT.3.NF.A.2', 'CCSS.MATH.CONTENT.3.NF.A.3'],
      topics: [
        {
          name: 'Understanding Fractions',
          content: 'A fraction represents equal parts of a whole or a collection. The numerator (top number) tells how many parts we have. The denominator (bottom number) tells how many equal parts the whole is divided into. For example, 3/4 means 3 parts out of 4 equal parts.',
          keyPoints: ['Numerator = parts we have', 'Denominator = total parts', 'Fractions are equal parts']
        },
        {
          name: 'Fraction Models',
          content: 'We can represent fractions using area models (shapes divided into equal parts), number lines, and set models (groups of objects). Number lines are especially helpful for comparing fractions and understanding that fractions can be greater than 1.',
          keyPoints: ['Area models', 'Number lines', 'Set models']
        },
        {
          name: 'Comparing Fractions',
          content: 'To compare fractions with the same denominators, compare the numerators. To compare fractions with the same numerators, compare the denominators. Using number lines and equivalent fractions helps when denominators or numerators are different.',
          keyPoints: ['Same denominator: compare numerators', 'Same numerator: compare denominators', 'Use models to compare']
        }
      ],
      assessments: ['Fraction manipulatives quiz', 'Comparing fractions test', 'Fraction art project']
    })
  },
  {
    title: 'Science Grade 9 - Biology Fundamentals',
    description: 'Introduction to cell biology, genetics, and evolution aligned with Oregon High School Biology Standards.',
    subject: 'Science',
    gradeLevel: '9',
    isPublic: true,
    content: JSON.stringify({
      standards: ['NGSS.LS1.1', 'NGSS.LS3.1', 'NGSS.LS4.1'],
      topics: [
        {
          name: 'Cell Structure and Function',
          content: 'Cells are the basic units of life. All living things are made of cells. Eukaryotic cells (like plant and animal cells) have a nucleus and membrane-bound organelles. Prokaryotic cells (like bacteria) are simpler and lack a nucleus.',
          keyPoints: ['Cells are basic units', 'Eukaryotic vs prokaryotic', 'Organelles have specific functions']
        },
        {
          name: 'Cellular Respiration and Photosynthesis',
          content: 'Photosynthesis converts light energy to chemical energy (glucose) in plants. Cellular respiration breaks down glucose to release energy. These processes are opposite but connected - the outputs of one are the inputs of the other.',
          keyPoints: ['Photosynthesis: CO2 + H2O → Glucose + O2', 'Cellular respiration: Glucose + O2 → CO2 + H2O + Energy', 'Both involve mitochondria']
        },
        {
          name: 'DNA and Genetics',
          content: 'DNA (deoxyribonucleic acid) carries genetic instructions for all living things. Genes are segments of DNA that code for specific traits. DNA is organized into chromosomes. Mendelian genetics explains how traits are passed from parents to offspring.',
          keyPoints: ['DNA structure: double helix', 'Genes code for proteins', 'Inherited traits follow patterns']
        }
      ],
      assessments: ['Cell model project', 'DNA extraction lab', 'Punnett square worksheet']
    })
  }
]

async function main() {
  console.log('Starting seed...')

  // Create demo teacher account
  const hashedPassword = await bcrypt.hash('teacher123', 10)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'teacher@demo.com' },
    update: {},
    create: {
      email: 'teacher@demo.com',
      password: hashedPassword,
      name: 'Demo Teacher'
    }
  })

  console.log('Created demo user:', demoUser.email)

  // Create curricula
  for (const curriculum of curricula) {
    const created = await prisma.curriculum.upsert({
      where: { id: curriculum.title.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        ...curriculum,
        id: curriculum.title.toLowerCase().replace(/\s+/g, '-')
      }
    })
    console.log('Created curriculum:', created.title)
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
