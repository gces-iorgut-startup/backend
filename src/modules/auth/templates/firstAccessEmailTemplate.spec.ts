import { describe, expect, it } from 'vitest'
import { renderFirstAccessEmail } from './firstAccessEmailTemplate'

describe('renderFirstAccessEmail', () => {
  it('deve renderizar o template com o nome do tutor e a URL do primeiro acesso', () => {
    const html = renderFirstAccessEmail({
      tutorName: 'Maria Silva',
      firstAccessUrl: 'http://localhost:5173/primeiro-acesso?token=secret-token-123',
      clinicName: 'Clínica Patinhas Felizes',
    })

    expect(html).toContain('Olá, Maria Silva!')
    expect(html).toContain('Clínica Patinhas Felizes')
    expect(html).toContain('href="http://localhost:5173/primeiro-acesso?token=secret-token-123"')
    expect(html).toContain('Definir Minha Senha')
    expect(html).toContain('48 horas')
  })

  it('deve usar o valor padrão para a clínica caso não seja informado', () => {
    const html = renderFirstAccessEmail({
      tutorName: 'João Santos',
      firstAccessUrl: 'http://localhost:5173/primeiro-acesso?token=abc',
    })

    expect(html).toContain('Olá, João Santos!')
    expect(html).toContain('sua clínica veterinária')
  })

  it('deve escapar HTML nos dados interpolados', () => {
    const html = renderFirstAccessEmail({
      tutorName: '<script>alert(1)</script>',
      firstAccessUrl: 'http://localhost:5173/primeiro-acesso?token=abc&x="y"',
      clinicName: 'Clínica <a href="http://malicioso.com">Clique</a>',
    })

    expect(html).not.toContain('<script>')
    expect(html).toContain('Olá, &lt;script&gt;alert(1)&lt;/script&gt;!')
    expect(html).not.toContain('<a href="http://malicioso.com">')
    expect(html).toContain('href="http://localhost:5173/primeiro-acesso?token=abc&amp;x=&quot;y&quot;"')
  })
})
