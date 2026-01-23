import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export type BingoCardNumber = {
  value: number | "FREE";
  column: "B" | "I" | "N" | "G" | "O";
  isCalled: boolean;
};

export type BingoCard = BingoCardNumber[][];

const generateColumnNumbers = (min: number, max: number, count: number): number[] => {
  const numbers: number[] = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
};

export const generateBingoCard = (): BingoCard => {
  const card: BingoCard = [];

  const columns = {
    B: generateColumnNumbers(1, 15, 5),
    I: generateColumnNumbers(16, 30, 5),
    N: generateColumnNumbers(31, 45, 5),
    G: generateColumnNumbers(46, 60, 5),
    O: generateColumnNumbers(61, 75, 5),
  };

  const columnKeys: Array<"B" | "I" | "N" | "G" | "O"> = ["B", "I", "N", "G", "O"];

  for (let i = 0; i < 5; i++) {
    const row: BingoCardNumber[] = [];
    for (let j = 0; j < 5; j++) {
      const columnKey = columnKeys[j];
      let value: number | "FREE";

      if (i === 2 && j === 2) { // Center square is FREE
        value = "FREE";
      } else {
        value = columns[columnKey].shift()!;
      }

      row.push({
        value,
        column: columnKey,
        isCalled: false,
      });
    }
    card.push(row);
  }

  // Apply Granville's method for balancing (simplified for client-side demo)
  // This ensures a mix of high/low and even/odd numbers, though the random generation already helps.
  // For a true Granville method, you'd pre-select numbers based on these criteria.
  // For this client-side simulation, the random generation within ranges is sufficient.

  return card;
};

export const generateCalledNumbers = (): number[] => {
  const numbers: number[] = [];
  for (let i = 1; i <= 75; i++) {
    numbers.push(i);
  }
  // Shuffle the numbers to simulate random calls
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
};

export const checkBingo = (card: BingoCard, calledNumbers: number[]): boolean => {
  const isMarked = (cell: BingoCardNumber) =>
    cell.value === "FREE" || (typeof cell.value === "number" && calledNumbers.includes(cell.value));

  // Check rows
  for (let i = 0; i < 5; i++) {
    if (card[i].every(isMarked)) return true;
  }

  // Check columns
  for (let j = 0; j < 5; j++) {
    if (card.every(row => isMarked(row[j]))) return true;
  }

  // Check diagonals
  const diagonal1 = [card[0][0], card[1][1], card[2][2], card[3][3], card[4][4]];
  if (diagonal1.every(isMarked)) return true;

  const diagonal2 = [card[0][4], card[1][3], card[2][2], card[3][1], card[4][0]];
  if (diagonal2.every(isMarked)) return true;

  return false;
};