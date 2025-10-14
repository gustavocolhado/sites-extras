import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! })

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const preferenceId = searchParams.get('preferenceId')

    if (!preferenceId) {
      return NextResponse.json({ error: 'ID da preferência é obrigatório' }, { status: 400 })
    }

    const preference = new Preference(client)
    const preferenceDetails = await preference.get({ preferenceId })

    return NextResponse.json(preferenceDetails)
  } catch (error) {
    console.error('Erro ao buscar detalhes da preferência do Mercado Pago:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar detalhes da preferência' },
      { status: 500 }
    )
  }
}
