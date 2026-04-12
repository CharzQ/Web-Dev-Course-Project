const { createApp } = Vue;

createApp({
  data() {
    return {
      currentPage: 'home',
      sessions: [],
      currentGraph: 'bar',
      newSession: {
        subject: '',
        duration: null,
        productivity: null,
        date: ''
      },
      days: [],
      selectedDay: null,
      filteredSessions: [],
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      studyPlan: '',
      prompt: ''
    };
  },

  methods: {
    // Form methods
    async fetchSessions() {
      const res = await fetch('http://localhost:3000/api/sessions');
      this.sessions = await res.json();

      this.$nextTick(() => {
        updateStudyChart(this.sessions);
        updateLineChart(this.sessions);
        updatePieChart(this.sessions);
      });
    },

    async addSession() {
      await fetch('http://localhost:3000/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newSession)
      });

      this.newSession = {
        subject: '',
        duration: null,
        productivity: null,
        date: ''
      };

      await this.fetchSessions();

      // Return to dashboard
      this.currentPage = 'home';
    },


    async deleteSession(id) {
      try {
        await fetch(`http://localhost:3000/api/sessions/${id}`, {
          method: 'DELETE',
        });

        // Refresh list after deletion
        this.fetchSessions();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },

    // Calendar methods
    generateCalendar() {
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

      this.days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        this.days.push(i);
      }
    },

    hasSession(day) {
      return this.sessions.some(s => {
        const d = new Date(s.date + "T00:00:00");

        return d.getDate() === day && d.getMonth() === this.currentMonth && d.getFullYear() === this.currentYear;
      });
    },

    selectDay(day) {
      this.selectedDay = day;

      this.filteredSessions = this.sessions.filter(s => {
        const d = new Date(s.date + "T00:00:00");

        return d.getDate() === day && d.getMonth() === this.currentMonth && d.getFullYear() === this.currentYear;
      });
    },

    nextMonth() {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.generateCalendar();
    },

    prevMonth() {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.generateCalendar();
    },

    goToToday() {
      const today = new Date();

      this.currentMonth = today.getMonth();
      this.currentYear = today.getFullYear();

      this.selectedDay = today.getDate();

      this.generateCalendar();
      this.selectDay(this.selectedDay);
    },
    async generateStudyPlan() {
      const res = await fetch('http://localhost:3000/api/generateStudyPlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: this.prompt })
      });
      this.studyPlan = await res.json();
      console.log(this.studyPlan)
      this.createCurrentStudyPlan();
      this.currentPage = 'generateStudyPlan';
    },
    createCurrentStudyPlan() {
      const studyPlanDisplay = $('#genratePlan');
      if ($(studyPlanDisplay).find('#currentStudyPlan').length === 0) {
        $(studyPlanDisplay).append(`<div id='currentStudyPlan' class= 'panel is-scrollable'></div>`);
        const currentStudyPlan = $('#currentStudyPlan');
        currentStudyPlan.append(`<div class='panel-heading'>Study Plan</div>`);
        //Needed to replace the \n with <br> to make it display properly
        currentStudyPlan.append(`<div class='panel-block'>${this.studyPlan.replaceAll(/\n/g, '<br>')}</div > `);
      } else {
        console.log("Notify")
        let $notification = $('#currentStudyPlan').before(`<div id='studyPlanNotification' class='notification is-info'><button class='delete'></button>Study Plan Has already been created please use the refine button to make changes to the study plan.<div>`);
        $('#studyPlanNotification .delete').on('click', function () {
          $('#studyPlanNotification').remove();
        });
      }

    }
  },

  watch: {
    currentPage(newPage) {
      if (newPage === 'calendar') {
        this.selectedDay = null;
        this.filteredSessions = [];
        this.fetchSessions();
        this.generateCalendar();
      }
      if (newPage === 'home') {
        this.$nextTick(() => {
          updateStudyChart(this.sessions);
          updateLineChart(this.sessions);
          updatePieChart(this.sessions);
        });
      }
    }
  },

  computed: {
    monthName() {
      const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
      ];
      return months[this.currentMonth];
    },
    weeklyData() {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 6);

      return this.sessions.filter(s => {
        const d = new Date(s.date);
        d.setHours(0, 0, 0, 0);
        return d >= weekAgo && d <= now;
      });
    },

    weeklyTime() {
      return this.weeklyData.reduce((sum, s) => sum + Number(s.duration || 0), 0);
    },

    weeklySessions() {
      return this.weeklyData.length;
    },

    weeklyProductivity() {
      if (this.weeklyData.length === 0) return 0;
      return (
        this.weeklyData.reduce((sum, s) => sum + Number(s.productivity || 0), 0)
        / this.weeklyData.length
      ).toFixed(1);
    }
  },

  mounted() {
    this.fetchSessions();
  }
}).mount('#app');
