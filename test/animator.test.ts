import { expect, it } from 'vitest'
import { simpleAnimator } from '../packages/core/src'
import { input, output } from './fixture'

it('animator', () => {
  const animator = simpleAnimator(input, output)

  expect([...animator]).toMatchSnapshot('animator')
})
