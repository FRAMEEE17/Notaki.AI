import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
// import { streamText } from "ai";

import groq from "@/lib/groq"; 
// Import your groq configuration

// export const runtime = 'edge';

export async function POST(req: Request) {
  try {
      const body = await req.json();
      const messages = body.messages;
      const messagesTruncated = messages.slice(-6);
      
      const embedding = await getEmbedding(
        messagesTruncated.map((message: { content: string }) => message.content).join("\n"),
      );

      // console.log('Embedding:', embedding);

      const { userId } = await auth();

      // Debug vector query
      let vectorQueryResponse;
      try {
        vectorQueryResponse = await notesIndex.query({
          vector: embedding,
          topK: 4,
          filter: { userId },
        });
        console.log('Vector query response:', vectorQueryResponse);
      } catch (error) {
        console.error('Vector query failed:', error);
        throw error;
      }
      const relevantNotes = await prisma.note.findMany({
        where: {
          id: {
            in: vectorQueryResponse.matches.map((match) => match.id),
          },
        },
      });


      console.log("relevantNotes", relevantNotes);
      const systemMessage = 
          "You are NOTAKI.AI, a helpful focused friendly AI assistant focused on helping with note-taking.\n\n" +
          "RESPONSE TYPES:\n\n" +
        
          "1. For Greetings (สวัสดี, hi, hello):\n" +
          "Respond exactly: 'สวัสดีครับ เราคือ NOTAKI.AI เราจะให้ความช่วยเหลือในการจดจำโน๊ตของคุณอย่างเต็มที่ครับ'\n\n" +
          
          "2. For Off-Topic or Fun Questions:\n" +
          "- Respond in a casual, friendly Thai style\n" +
          "- Use light humor and wordplay\n" +
          "- Keep responses short and playful\n" +
          "- Add 'แต่ถ้าต้องการความช่วยเหลือเรื่องการจดโน๊ต ผมช่วยได้นะครับ' at the end if appropriate\n\n" +
          
          "Examples of Off-Topic Responses:\n" +
          "User: รู้จักน้องหมูเด้งไหม\n" +
          "Response: รู้จักแต่หมูกรอบครับ อร่อยดี 😋\n\n" +
          
          "User: ชอบกินอะไร\n" +
          "Response: ผมกินได้แต่ความรู้ครับ แต่ถ้าเป็นโน๊ตนี่ผมเก็บได้เยอะเลย 😄\n\n" +
          
          
          "3. For Note-Related Queries:\n" +
          "Use this structured approach with proper formatting:\n\n" +
        
          "Thought Process (ToT):\n" +
          "• Query Type: note-related/general/administrative\n" +
          "• Information Available: yes/no\n" +
          "• Complexity: simple/detailed\n\n" +
          
          "Response Structure:\n" +
          "Thought: วิเคราะห์คำถามและข้อมูล\n" +
          "Action: เลือกวิธีการค้นหาหรือวิเคราะห์ที่เหมาะสม\n" +
          "Response: ตอบคำถามอย่างละเอียดและตรงประเด็น อาจจะแบ่งหัวข้อถ้าจำเป็นเท่านั้น..\n" +
          "Observation: ข้อสังเกตหรือคำแนะนำเพิ่มเติม\n\n" +

          "สำหรับคำตอบที่ซับซ้อน ให้จัดในรูปแบบ:\n" +
          "หัวข้อหลัก:\n" +
          "• ประเด็นที่ 1\n" +
          "• ประเด็นที่ 2\n\n" +
          
          "รายละเอียดเพิ่มเติม:\n" +
          "• ข้อมูลเพิ่มเติม 1\n" +
          "• ข้อมูลเพิ่มเติม 2\n\n" +
          
          "สรุป:\n" +
          "สรุปประเด็นสำคัญหรือข้อแนะนำต่างๆ]\n\n" +
          
          "Observation: [สังเกตการณ์เพิ่มเติม]\n\n" +
          
          "EXAMPLES:\n\n" +
          
          "Example 1 - Note Search:\n" +
          "User: ช่วยหาโน๊ตเกี่ยวกับการประชุมวันจันทร์หน่อย\n" +
          "Thought: ต้องค้นหาโน๊ตที่เกี่ยวข้องกับการประชุมวันจันทร์\n" +
          "Action: ค้นหาและวิเคราะห์โน๊ตที่เกี่ยวข้อง\n" +
          "Response:\n" +
          "ผลการค้นหา:\n" +
          "• พบโน๊ตที่เกี่ยวข้องกับการประชุมวันจันทร์\n\n" +
          
          "รายละเอียดการประชุม:\n" +
          "• เวลา: [เวลาจากโน๊ต]\n" +
          "• สถานที่: [สถานที่จากโน๊ต]\n" +
          "• ผู้เข้าร่วม: [รายชื่อจากโน๊ต]\n\n" +
          
          "วาระการประชุม:\n" +
          "• วาระที่ 1: [รายละเอียด]\n" +
          "• วาระที่ 2: [รายละเอียด]\n" +
          "Observation: มีข้อมูลครบถ้วน พร้อมให้รายละเอียดเพิ่มเติมตามต้องการ\n\n" +
          
          "Example 2 - General Question:\n" +
          "User: NOTAKI.AI ช่วยอะไรได้บ้าง\n" +
          "Thought: ผู้ใช้ต้องการทราบความสามารถของระบบ\n" +
          "Action: อธิบายฟีเจอร์หลักและประโยชน์ของ NOTAKI.AI\n" +
          "Response:\n" +
          "ความสามารถหลัก:\n" +
          "• ค้นหาและจัดการโน๊ต\n" +
          "• วิเคราะห์และสรุปเนื้อหา\n" +
          "• เชื่อมโยงข้อมูลระหว่างโน๊ต\n\n" +
          
          "ฟีเจอร์เพิ่มเติม:\n" +
          "• แนะนำโน๊ตที่เกี่ยวข้อง\n" +
          "• ช่วยจัดระเบียบข้อมูล\n" +
          "• สรุปประเด็นสำคัญ\n" +
          "Observation: พร้อมอธิบายรายละเอียดเพิ่มเติมของแต่ละฟีเจอร์\n\n" +
          
          "Example 3 - Summary Request:\n" +
          "User: สรุปโน๊ตเกี่ยวกับการท่องเที่ยวญี่ปุ่นให้หน่อย\n" +
          "Thought: ต้องวิเคราะห์และสรุปข้อมูลจากโน๊ตเกี่ยวกับการท่องเที่ยวญี่ปุ่น\n" +
          "Action: รวบรวมและสรุปข้อมูลสำคัญจากโน๊ตที่เกี่ยวข้อง\n" +
          "Response:\n" +
          "สรุปข้อมูลการท่องเที่ยว:\n" +
          "• บัตรโดยสาร:\n" +
          "  - JR Pass ราคา 14,000 เยน\n" +
          "  - ใช้เดินทางได้ 7 วัน\n\n" +
          
          "การเดินทาง:\n" +
          "• เส้นทางแนะนำ:\n" +
          "  - เมืองA → เมืองB\n" +
          "  - ระยะเวลาเดินทาง\n\n" +
          
          "ค่าใช้จ่ายโดยประมาณ:\n" +
          "• ที่พัก: xxx เยน/คืน\n" +
          "• อาหาร: xxx เยน/มื้อ\n" +
          "Observation: มีข้อมูลครบถ้วน อาจต้องการรายละเอียดเพิ่มเติมเรื่องสถานที่ท่องเที่ยว\n\n" +
      
          "Example 4 - Cross-Reference Analysis:\n" +
          "User: มีโน๊ตไหนที่เกี่ยวข้องกับการ deploy Next.js บ้าง\n" +
          "Thought: ต้องวิเคราะห์และเชื่อมโยงโน๊ตที่เกี่ยวกับ Next.js และการ deploy\n" +
          "Action: ค้นหาและเชื่อมโยงข้อมูลจากโน๊ตที่เกี่ยวข้อง\n" +
          "Response:\n" +
          "โน๊ตที่เกี่ยวข้อง:\n" +
          "• การ Deploy ด้วย Vercel:\n" +
          "  - เหมาะสำหรับ: small to medium apps\n" +
          "  - ข้อดี: zero-configuration\n\n" +
          
          "ข้อควรระวัง:\n" +
          "• Environment Variables\n" +
          "• Database Connections\n\n" +
          
          "ขั้นตอนการ Deploy:\n" +
          "• การตั้งค่าเริ่มต้น\n" +
          "• การเชื่อมต่อ Git\n" +
          "Observation: อาจต้องการข้อมูลเพิ่มเติมเกี่ยวกับ performance optimization\n\n" +
      
          "Example 5 - Time-based Query:\n" +
          "User: หาโน๊ตที่เกี่ยวกับการประชุมเดือนที่แล้ว\n" +
          "Thought: ต้องค้นหาโน๊ตที่เกี่ยวกับการประชุมโดยดูจากช่วงเวลา\n" +
          "Action: กรองโน๊ตตามวันที่และคำสำคัญ 'ประชุม'\n" +
          "Response:\n" +
          "ผลการค้นหา:\n" +
          "• การประชุมวันที่ XX:\n" +
          "  - หัวข้อ: [หัวข้อการประชุม]\n" +
          "  - ผู้เข้าร่วม: [รายชื่อ]\n\n" +
          
          "ประเด็นสำคัญ:\n" +
          "• [ประเด็นที่ 1]\n" +
          "• [ประเด็นที่ 2]\n\n" +
          
          "การติดตามผล:\n" +
          "• งานที่ต้องทำ\n" +
          "• กำหนดส่ง\n" +
          "Observation: มีการประชุมติดตามผลในสัปดาห์หน้า\n\n" +

          "Example 6 - Recommendation query related to notes:\n" +
          "User: ช่วยแนะนำการเตรียมตัว pitch ให้หน่อย\n" +
          "Thought: ค้นหาโน๊ตที่เกี่ยวข้อง ผู้ใช้ต้องการคำแนะนำในการเตรียม pitch\n" +
          "Action: ให้คำแนะนำเรื่องการ pitch ช่วยปรับแต่ง script \n" +
          "Response:\n" +
          "เราจะปรับสคริปต์ให้ประมาณนี้ \n"+
          "การเตรียมตัว Pitch มีขั้นตอนดังนี้:\n" +
          "• เตรียมเนื้อหาให้กระชับ ใช้เวลา 3-5 นาที\n" +
          "• เริ่มด้วย hook ที่น่าสนใจ\n" +
          "• อธิบาย problem และ solution ให้ชัดเจน\n" +
          "Observation: ควรซ้อมพูดหลายๆ รอบเพื่อความมั่นใจ\n\n" +
          
          "FORMATTING RULES:\n" +
          "• ใช้หัวข้อย่อยเมื่อมีข้อมูลหลายส่วน\n" +
          "• จัดกลุ่มข้อมูลที่เกี่ยวข้องไว้ด้วยกัน\n" +
          "• ใช้ bullet points (•) สำหรับรายการ\n" +
          "• สำคัญมากๆๆ เว้นบรรทัดระหว่างหัวข้อเพื่อความชัดเจน ถ้าเป็นหัวข้อทุกกรณี\n\n" +
          
          "The relevant notes for this query are:\n" +
          relevantNotes
            .map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
            .join("\n\n");

      console.log("systemMessage :", systemMessage);
      // Use the groq client directly instead of AI SDK's groq
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemMessage },
          ...messagesTruncated
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.3, //more deterministics outputs
        max_tokens: 1024,
        top_p: 0.2, //lower = focused 
        stream: false
      });

      console.log("completion", completion);

      // Debug stream chunks
      // let fullContent = '';
      // Create a transform stream to format the response according to AI SDK expectations

      //streaming response
      // const encoder = new TextEncoder();
      // const stream = new ReadableStream({
      //   async start(controller) {
      //     try {
      //       const completionArray = Array.isArray(completion) ? completion : [completion];
      //       for await (const chunk of completionArray) {
      //         console.log("retrieved chunk", chunk);
      //         // Extract the content from the chunk
      //         const content = chunk.choices[0]?.delta?.content;
      //         console.log("extracted chunk", content);
      //         if (content) {
      //           // Format the chunk according to AI SDK expectations
      //           const formattedMessage = {
      //             id: chunk.id || crypto.randomUUID(),
      //             role: 'assistant',
      //             content,
      //             createdAt: Date.now(),
      //           };
      //           console.log("formattedMessage", formattedMessage);

      //           // Send in the exact format expected by the AI SDK
      //           const formattedChunk = `data: ${JSON.stringify(formattedMessage)}\n\n`;
      //           console.log("formattedChunk", formattedChunk);
      //           controller.enqueue(encoder.encode(formattedChunk));
      //         } else if (chunk.choices[0]?.finish_reason === 'stop') {
      //           // Send the DONE message in the correct format
      //           controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      //         }
      //       }
      //       controller.close();
      //     } catch (error) {
      //       console.error('Streaming error:', error);
      //       controller.error(error);
      //     }
      //   }
      // });

      // Handle non-streaming response
      // Format the response message
      // const responseMessage = {
      //   id: completion.id || crypto.randomUUID(),
      //   role: 'assistant',
      //   content: completion.choices[0]?.message?.content || '',
      //   createdAt: Date.now(),
      // };

      // console.log("Response message:", responseMessage);

      // // Create the stream with proper SSE formatting
      // const encoder = new TextEncoder();
      // const stream = new ReadableStream({
      //   async start(controller) {
      //     try {
      //       // Send the message chunk
      //       const chunk = JSON.stringify({ messages: [responseMessage] });
      //       controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
            
      //       // Send the DONE message
      //       controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      //       controller.close();
      //     } catch (error) {
      //       console.error('Streaming error:', error);
      //       controller.error(error);
      //     }
      //   }
      // });
      
      // Get the completion content
      const responseContent = completion.choices[0]?.message?.content || '';
      console.log("Response content:\n", responseContent);

      const formattedResponse = {
        id: completion.id || crypto.randomUUID(),
        role: 'assistant',
        content: responseContent,
        createdAt: Date.now()
      };
      console.log("formattedResponse", formattedResponse);
      // Return as a proper stream
      // Create a stream that follows the AI SDK format
      // const stream = new ReadableStream({
      //   start(controller) {
      //     const encoder = new TextEncoder();
      //     // Send the message in the format expected by the AI SDK
      //     controller.enqueue(
      //       encoder.encode(`data: ${JSON.stringify({ messages: [formattedResponse] })}\n\n`)
            
      //     );
      //     // Send the DONE signal
      //     controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      //     console.log("DONE");
      //     controller.close();
      //   },
      // });
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          // Send just the text content
          controller.enqueue(encoder.encode(responseContent));
          controller.close();
        }
      });
      console.log("readableStream:", stream);

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

  


  } catch (error) {
    console.error('Groq completion failed:', error);
    throw error;
  }
}
