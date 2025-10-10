import { filter, includes, map, split } from 'lodash-es';

const BANNED_WORDS_FOR_INITIALS = ['Real', 'Atlético', 'Deportivo', 'Beti', 'Fundación', 'San', 'Santo', 'Santa'];

export interface ObjectWithName {
  name: string;
}

export class Utils {
  private static removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  public static getInitials(teamName: string, avoidDuplicatesIteration = 0): string {
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

        if (avoidDuplicatesIteration > 0) {
          initials = initials.substring(0, 2) + (avoidDuplicatesIteration + 1);
        }
      }
    }

    return Utils.removeAccents(initials.toUpperCase());
  }

  private static getInitialsWithoutDuplicates(teamName: string, existingInitials: Set<string>): string {
    let initials = Utils.getInitials(teamName);
    let iteration = 0;
    while (existingInitials.has(initials)) {
      iteration++;
      initials = Utils.getInitials(teamName, iteration);
    }

    return initials;
  }

  public static getInitialsBulk<T extends ObjectWithName, TI extends T & { initials: string }>(teams: T[]): TI[] {
    const existingInitials = new Set<string>();
    return map(teams, (team) => {
      const initials = Utils.getInitialsWithoutDuplicates(team.name, existingInitials);
      existingInitials.add(initials);
      return { ...team, initials } as TI;
    });
  }
}
