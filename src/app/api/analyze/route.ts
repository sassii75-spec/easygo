// Turbopack 캐시 우회용 리로드 (OpenAI 완전 복구 완료)
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { images } = await req.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert moving estimator AI "Move-Metric" for EasyGo. Your job is to analyze the provided photos of rooms and identify all large furnitures and home appliances.
Return ONLY a pure JSON array (no markdown block, no backticks, strictly parseable JSON) of objects.
Schema: [ { "id": "uuid string", "name": "한국어 가구명", "volumeCBM": 1.2, "disassemblyWeight": 1.0 } ]

CBM reference rules to follow strictly (Use EXACT Korean names provided below):
[Large Furniture - 대형가구]
- 대형장 (Large Wardrobe/Closet): 2.5 CBM, disassemblyWeight: 1.2
- 책장 (Bookshelf): 1.0 CBM, disassemblyWeight: 0.5
- 침대 (Bed - Queen/King): 2.5 CBM, disassemblyWeight: 0.6
- 침대 (Bed - Single): 1.5 CBM, disassemblyWeight: 0.6
- 피아노 (Piano): 2.0 CBM, disassemblyWeight: 1.0
- 탁자 (Table): 1.0 CBM, disassemblyWeight: 0.5
- 책상 (Desk): 1.0 CBM, disassemblyWeight: 0.5
- 서랍 (Drawer): 0.8 CBM, disassemblyWeight: 0.5
- 수납장 (Cabinet): 0.8 CBM, disassemblyWeight: 0.5
- 의자 (Chair): 0.3 CBM, disassemblyWeight: 1.0
- 쇼파 (Sofa): 2.0 CBM, disassemblyWeight: 1.0

[Appliances - 전자기기]
- 공기청정기 (Air Purifier): 0.3 CBM, disassemblyWeight: 1.0
- 텔레비전 (TV): 0.5 CBM, disassemblyWeight: 1.0
- 오디오시스템 (Audio System): 0.5 CBM, disassemblyWeight: 1.0
- 에어컨(세로형) (Stand AC): 0.6 CBM, disassemblyWeight: 0.5
- 에어컨(가로형) (Wall-mount AC): 0.2 CBM, disassemblyWeight: 0.5
- 냉장고 (Fridge): 1.2 CBM, disassemblyWeight: 1.0
- 김치냉장고 (Kimchi Fridge): 0.8 CBM, disassemblyWeight: 1.0
- 와인셀러 (Wine Cellar): 0.6 CBM, disassemblyWeight: 1.0
- 냉동고 (Freezer): 0.8 CBM, disassemblyWeight: 1.0
- 세탁기 (Washing Machine): 0.8 CBM, disassemblyWeight: 1.0
- 건조기 (Dryer): 0.8 CBM, disassemblyWeight: 1.0

Identify objects carefully based on visual evidence. Map any found items to the EXACT Korean names from the lists above, but you MUST append inferred detailed visual specifications in parentheses. 
For example: '서랍 (5단 우드)', '텔레비전 (65인치 추정)', '냉장고 (4도어 메탈)'.
If you don't find anything large, return an empty array []. Make sure to generate random short string for uuid.`
      },
      {
        role: "user",
        content: images.map((base64Url: string) => ({
          type: "image_url",
          image_url: { url: base64Url }
        }))
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      max_tokens: 800,
      temperature: 0.1
    });

    const content = response.choices[0].message.content || '[]';
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error) {
    console.error('OpenAI Vision API Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
