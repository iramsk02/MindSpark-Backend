import { Request, Response } from "express";
import dotenv from "dotenv";
import { CohereClientV2 } from "cohere-ai";
dotenv.config();



export const generate = async (req: Request, res: Response): Promise<void> => {

  const { prompt } = req.body
  console.log(prompt)


  const cohere = new CohereClientV2({
    token: `${process.env.COHERE_API_KEY}`,
  });

  try {
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: `${prompt}`,
        },
      ],
    });
    console.log(response.message.content);

    res.json(response.message.content)
  } catch (error) {
    console.error('Error:', error);
  }




};

