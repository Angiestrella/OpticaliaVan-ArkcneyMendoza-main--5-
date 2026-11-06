import { describe, expect, it } from 'vitest'
import { analizarRostro, RASGOS, type FormaRostro, type RespuestasRostro } from './identificarRostro'

const FORMAS: FormaRostro[] = ['corazon', 'diamante', 'ovalado', 'rectangular', 'redondo', 'triangular']
const OPCIONES = {
  proporcion: ['largo', 'equilibrado', 'ancho'],
  anchura: ['frente', 'pomulos', 'mandibula', 'uniforme'],
  estrechamiento: ['suave', 'marcado', 'constante'],
  mandibula: ['suave', 'recta', 'estrecha'],
} as const

function todasLasCombinaciones(): RespuestasRostro[] {
  const lista: RespuestasRostro[] = []
  for (const proporcion of OPCIONES.proporcion)
    for (const anchura of OPCIONES.anchura)
      for (const estrechamiento of OPCIONES.estrechamiento)
        for (const mandibula of OPCIONES.mandibula)
          lista.push({ proporcion, anchura, estrechamiento, mandibula })
  return lista
}

const rostro = (proporcion: RespuestasRostro['proporcion'], anchura: RespuestasRostro['anchura'], estrechamiento: RespuestasRostro['estrechamiento'], mandibula: RespuestasRostro['mandibula']) =>
  analizarRostro({ proporcion, anchura, estrechamiento, mandibula })

describe('analizarRostro', () => {
  it('un perfil típico se afirma sin rasgos añadidos', () => {
    expect(rostro('largo', 'pomulos', 'suave', 'suave').frase).toBe('Tu rostro es ovalado.')
    expect(rostro('equilibrado', 'uniforme', 'constante', 'suave').frase).toBe('Tu rostro es redondo.')
    expect(rostro('largo', 'uniforme', 'constante', 'recta').frase).toBe('Tu rostro es rectangular.')
    expect(rostro('equilibrado', 'pomulos', 'marcado', 'estrecha').frase).toBe('Tu rostro tiene forma de diamante.')
    expect(rostro('equilibrado', 'frente', 'marcado', 'estrecha').frase).toBe('Tu rostro tiene forma de corazón.')
    expect(rostro('equilibrado', 'mandibula', 'constante', 'recta').frase).toBe('Tu rostro es triangular.')
  })

  it('una respuesta distinta al perfil se vuelve rasgo secundario', () => {
    expect(rostro('largo', 'pomulos', 'suave', 'recta').frase).toBe('Tu rostro es ovalado, con una mandíbula más marcada.')
    expect(rostro('largo', 'mandibula', 'constante', 'recta').frase).toBe('Tu rostro es principalmente rectangular, con una mandíbula más amplia.')
    expect(rostro('largo', 'frente', 'marcado', 'estrecha').frase).toBe('Tu rostro tiene una forma principalmente de corazón, con una proporción ligeramente alargada.')
  })

  it('rostros distintos de la misma forma principal no reciben el mismo resultado', () => {
    const ovalados = [rostro('largo', 'pomulos', 'suave', 'suave'), rostro('largo', 'pomulos', 'suave', 'recta'), rostro('largo', 'frente', 'suave', 'suave')]
    expect(ovalados.every((r) => r.forma === 'ovalado')).toBe(true)
    expect(new Set(ovalados.map((r) => r.frase)).size).toBe(3)
  })

  it('una respuesta que contradice la forma impide afirmarla sin matices', () => {
    expect(rostro('largo', 'uniforme', 'marcado', 'recta').frase).toContain('principalmente rectangular')
    expect(rostro('equilibrado', 'mandibula', 'marcado', 'recta').frase).toContain('principalmente triangular')
  })

  it('si ninguna forma destaca, no fuerza una clasificación', () => {
    for (const r of [rostro('largo', 'frente', 'suave', 'recta'), rostro('ancho', 'uniforme', 'marcado', 'estrecha')]) {
      expect(r.forma).toBeNull()
      expect(r.formas.length).toBeGreaterThan(1)
      expect(r.frase).toBe('Tu rostro combina características de varias formas.')
    }
  })

  it('el rasgo y la explicación salen solo de lo que se respondió', () => {
    for (const r of todasLasCombinaciones()) {
      const { forma, frase, explicacion } = analizarRostro(r)
      const rasgo = frase.split(', ')[1]?.replace(/\.$/, '')
      if (rasgo) {
        const elegidos = (Object.keys(r) as (keyof RespuestasRostro)[]).map((p) => (RASGOS[p] as Record<string, string>)[r[p]])
        expect(elegidos, JSON.stringify(r)).toContain(rasgo)
      }
      if (!forma) expect(frase).not.toContain(', ')
      expect(explicacion, JSON.stringify(r)).toMatch(/señalaste [a-záéíóúñ]/i)
      expect(frase + explicacion).not.toMatch(/\d|%|exact/)
    }
  })

  it('salen las 6 formas, ninguna acapara y los combinados son minoría', () => {
    const resultados = todasLasCombinaciones().map(analizarRostro)
    for (const forma of FORMAS) {
      const parte = resultados.filter((r) => r.forma === forma).length / resultados.length
      expect(parte, forma).toBeGreaterThan(0.05)
      expect(parte, forma).toBeLessThan(0.25)
    }
    expect(resultados.filter((r) => !r.forma).length / resultados.length).toBeLessThan(0.35)
  })

  it('cada una de las 4 preguntas puede cambiar el resultado', () => {
    for (const [pregunta, valores] of Object.entries(OPCIONES)) {
      const influye = todasLasCombinaciones().some((r) =>
        valores.some((v) => analizarRostro({ ...r, [pregunta]: v }).forma !== analizarRostro(r).forma),
      )
      expect(influye, pregunta).toBe(true)
    }
  })
})
