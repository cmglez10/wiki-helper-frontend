import { filter, includes, split } from 'lodash-es';

const BANNED_WORDS_FOR_INITIALS = ['Real', 'Atlético', 'Deportivo', 'Beti', 'Fundación'];

export class Utils {
  private static removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  public static getInitials(teamName: string): string {
    const mainPortions = filter(split(teamName, ' '), (portion) => portion.length > 2);
    let initialsLeft = 3;
    let portionIndex = 0;
    let initials = '';
    while (initialsLeft > 0) {
      const portion = mainPortions[portionIndex];
      if (includes(BANNED_WORDS_FOR_INITIALS, portion)) {
        initials += portion.substring(0, 1);
        initialsLeft--;
        portionIndex++;
      } else {
        initials += portion.substring(0, initialsLeft);
        initialsLeft = 0;
      }
    }
    return Utils.removeAccents(initials.toUpperCase());
  }
}
