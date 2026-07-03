// Implementación del redondeo forense del Decreto 494
// Redondeo: <=25 → base, <=75 → base+50, >75 → base+100

export class CalculateFareByDecree494UseCase {
  execute(amountCents: number): number {
    const baseCents = Math.floor(amountCents / 100) * 100;
    const remainder = amountCents % 100;

    if (remainder <= 25) return baseCents;
    else if (remainder <= 75) return baseCents + 50;
    else return baseCents + 100;
  }
}
