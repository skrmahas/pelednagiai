import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface Wager {
  id: string;
  matchId: string;
  oddsHome: number;
  oddsAway: number;
  description?: string;
  bets: Bet[];
}

export interface Bet {
  id: string;
  visitorName: string;
  teamId: string;
  amount: number;
  timestamp: string;
}

export async function getWagers(): Promise<Wager[]> {
  const filePath = path.join(DATA_DIR, 'wagers.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getWager(id: string): Promise<Wager | undefined> {
  const wagers = await getWagers();
  return wagers.find(w => w.id === id);
}

export async function getWagerByMatch(matchId: string): Promise<Wager | undefined> {
  const wagers = await getWagers();
  return wagers.find(w => w.matchId === matchId);
}

export async function createWager(wager: Omit<Wager, 'id' | 'bets'>): Promise<Wager> {
  const filePath = path.join(DATA_DIR, 'wagers.json');
  const wagers = await getWagers();
  const newId = String(Math.max(...wagers.map(w => parseInt(w.id)), 0) + 1);
  const newWager: Wager = { id: newId, ...wager, bets: [] };
  wagers.push(newWager);
  await fs.writeFile(filePath, JSON.stringify(wagers, null, 2));
  return newWager;
}

export async function addBet(wagerId: string, bet: Omit<Bet, 'id' | 'timestamp'>): Promise<Wager | null> {
  const filePath = path.join(DATA_DIR, 'wagers.json');
  const wagers = await getWagers();
  const index = wagers.findIndex(w => w.id === wagerId);
  if (index === -1) return null;
  
  const newBet: Bet = {
    id: String(wagers[index].bets.length + 1),
    ...bet,
    timestamp: new Date().toISOString(),
  };
  wagers[index].bets.push(newBet);
  await fs.writeFile(filePath, JSON.stringify(wagers, null, 2));
  return wagers[index];
}

export async function updateWager(
  id: string,
  updates: Partial<Pick<Wager, 'oddsHome' | 'oddsAway' | 'description'>>
): Promise<Wager | null> {
  const filePath = path.join(DATA_DIR, 'wagers.json');
  const wagers = await getWagers();
  const index = wagers.findIndex(w => w.id === id);
  if (index === -1) return null;
  wagers[index] = { ...wagers[index], ...updates };
  await fs.writeFile(filePath, JSON.stringify(wagers, null, 2));
  return wagers[index];
}

export async function deleteWager(id: string): Promise<boolean> {
  const filePath = path.join(DATA_DIR, 'wagers.json');
  const wagers = await getWagers();
  const index = wagers.findIndex(w => w.id === id);
  if (index === -1) return false;
  wagers.splice(index, 1);
  await fs.writeFile(filePath, JSON.stringify(wagers, null, 2));
  return true;
}
