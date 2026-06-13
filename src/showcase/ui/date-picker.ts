import { ExbaComponent } from '../../kernel/core/component';
import { t, ease } from '../../shell/styles';

const STYLES = `
  .container {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: inherit;
  }
  .card {
    background: ${t.zinc900a};
    border: 1px solid ${t.zinc800};
    border-radius: 0.75rem;
    padding: 0.75rem 2rem;
    width: 800px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    box-sizing: border-box;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }
  .navBtn {
    background: transparent;
    border: 1px solid ${t.zinc800};
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${t.zinc200};
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: all ${ease};
  }
  .navBtn:hover {
    background: ${t.zinc800};
    border-color: ${t.zinc600};
    transform: scale(1.05);
  }
  .title {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${t.zinc100};
    letter-spacing: -0.01em;
  }
  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    gap: 0.25rem;
  }
  .weekday {
    font-size: 0.875rem;
    font-weight: 700;
    color: ${t.zinc500};
    text-transform: uppercase;
    padding: 0.125rem 0;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    text-align: center;
  }
  .day {
    font-size: 1rem;
    font-weight: 500;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0;
    cursor: pointer;
    transition: all ${ease};
    color: ${t.zinc200};
    box-sizing: border-box;
    border: 1px solid transparent;
  }
  .day.current:hover {
    background: ${t.zinc800};
    border-color: ${t.zinc700};
  }
  .day.selected {
    background: ${t.indigo600};
    color: ${t.white};
    font-weight: 700;
    border-color: ${t.indigo400};
  }
  .day.selected:hover {
    background: ${t.indigo500};
  }
  .day.outside {
    color: ${t.zinc600};
    opacity: 0.5;
  }
  .day.outside:hover {
    background: ${t.zinc900};
  }
  .footer {
    border-top: 1px solid ${t.zinc800};
    padding-top: 0.75rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
  .footerLabel {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: ${t.zinc500};
    letter-spacing: 0.05em;
    font-weight: 700;
  }
  .footerValue {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${t.indigo300};
  }
`;

/**
 * A highly interactive Date Picker component.
 * Features monthly navigation, multi-month awareness (rendering leading/trailing days),
 * and custom event emitting on selection.
 */
export class DatePickerComponent extends ExbaComponent {
  /** Uses Shadow DOM to encapsulate the calendar grid styles. */
  static useShadow = true;
  /** Inject the comprehensive CSS string for the calendar UI. */
  static styles = STYLES;

  /**
   * Initializes state with the current date.
   */
  constructor() {
    super();
    const today = new Date();
    this.setState({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth(),
      selectedYear: today.getFullYear(),
      selectedMonth: today.getMonth(),
      selectedDay: today.getDate()
    });
  }

  /**
   * Internal helper to calculate total days in a given month.
   */
  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Internal helper to find the starting weekday of a month (0-6).
   */
  private getFirstDayOfWeek(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }

  /**
   * Selects a specific date and updates the internal state.
   * Emits a 'date-change' event with the formatted ISO date string.
   * @param day The day number.
   * @param isOutside Whether the day belongs to the current, previous, or next month.
   */
  public selectDate(day: number, isOutside: 'prev' | 'next' | 'current' = 'current') {
    let year = this.state.currentYear;
    let month = this.state.currentMonth;

    if (isOutside === 'prev') {
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
    } else if (isOutside === 'next') {
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    this.setState({
      selectedYear: year,
      selectedMonth: month,
      selectedDay: day,
      currentYear: year,
      currentMonth: month
    });

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.emit('date-change', { date: dateStr });
  }

  /**
   * Navigates the calendar to the previous or next month.
   * @param direction Navigation direction.
   */
  public changeMonth(direction: 'prev' | 'next') {
    let month = this.state.currentMonth;
    let year = this.state.currentYear;

    if (direction === 'prev') {
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
    } else {
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    this.setState({
      currentMonth: month,
      currentYear: year
    });
  }

  /**
   * Renders the calendar card with header navigation, weekday labels, and the day grid.
   */
  render() {
    const { currentYear, currentMonth, selectedYear, selectedMonth, selectedDay } = this.state;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const totalDays = this.getDaysInMonth(currentYear, currentMonth);
    const startDayOfWeek = this.getFirstDayOfWeek(currentYear, currentMonth);

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = this.getDaysInMonth(prevYear, prevMonth);

    const cells: Array<{ day: number; isOutside: 'prev' | 'next' | 'current'; isSelected: boolean }> = [];

    // Prev month trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      cells.push({
        day: dayNum,
        isOutside: 'prev',
        isSelected: selectedYear === prevYear && selectedMonth === prevMonth && selectedDay === dayNum
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        day: i,
        isOutside: 'current',
        isSelected: selectedYear === currentYear && selectedMonth === currentMonth && selectedDay === i
      });
    }

    // Next month leading days
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const remainingCells = (cells.length <= 35 ? 35 : 42) - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      cells.push({
        day: i,
        isOutside: 'next',
        isSelected: selectedYear === nextYear && selectedMonth === nextMonth && selectedDay === i
      });
    }

    const selectedDateObj = new Date(selectedYear, selectedMonth, selectedDay);
    const formattedSelectedDate = selectedDateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div class="container">
        <div class="card">
          <header class="header">
            <button class="navBtn" onclick="this.getRootNode().host.changeMonth('prev')">‹</button>
            <div class="title">${monthNames[currentMonth]} ${currentYear}</div>
            <button class="navBtn" onclick="this.getRootNode().host.changeMonth('next')">›</button>
          </header>

          <div class="weekdays">
            ${daysOfWeek.map(day => `<div class="weekday">${day}</div>`).join('')}
          </div>

          <div class="grid">
            ${cells.map(cell => {
              let classes = 'day';
              if (cell.isSelected) {
                classes += ' selected';
              } else if (cell.isOutside !== 'current') {
                classes += ' outside';
              } else {
                classes += ' current';
              }

              return `
                <div 
                  class="${classes}" 
                  onclick="this.getRootNode().host.selectDate(${cell.day}, '${cell.isOutside}')"
                >
                  ${cell.day}
                </div>
              `;
            }).join('')}
          </div>

          <footer class="footer">
            <span class="footerLabel">Selected Date</span>
            <span class="footerValue">${formattedSelectedDate}</span>
          </footer>
        </div>
      </div>
    `;
  }
}

customElements.define('exba-date-picker', DatePickerComponent);
