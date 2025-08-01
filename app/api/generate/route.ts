import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    const prompt = `Suggest a short, attractive title and category for this product description: "${description}"

Please respond with only a JSON object in this exact format:
{
  "title": "Short attractive title (max 50 characters)",
  "category": "One of: Electronics, Books, Clothing, Sports, Furniture, Other"
}

Make the title catchy and descriptive. Choose the most appropriate category from the list.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates product titles and categories for a campus buy/sell platform. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Try to parse the JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(response)
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid response format from AI')
      }
    }

    // Validate the response
    if (!parsedResponse.title || !parsedResponse.category) {
      throw new Error('Invalid response structure from AI')
    }

    // Ensure category is valid
    const validCategories = ['Electronics', 'Books', 'Clothing', 'Sports', 'Furniture', 'Other']
    if (!validCategories.includes(parsedResponse.category)) {
      parsedResponse.category = 'Other'
    }

    return NextResponse.json({
      title: parsedResponse.title,
      category: parsedResponse.category,
    })

  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
} 