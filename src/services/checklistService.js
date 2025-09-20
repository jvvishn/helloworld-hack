class ChecklistService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  }

  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Personal Checklists
  async getPersonalChecklists() {
    try {
      const response = await fetch(`${this.baseURL}/checklists/personal`, {
        headers: this.getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching personal checklists:", error);
      // Return mock data for development
      return this.getMockPersonalChecklists();
    }
  }

  async createPersonalChecklist(checklistData) {
    try {
      const response = await fetch(`${this.baseURL}/checklists/personal`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(checklistData),
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating personal checklist:", error);
      return this.mockCreatePersonalChecklist(checklistData);
    }
  }

  // Group Checklists
  async getGroupChecklists(groupId) {
    try {
      const response = await fetch(
        `${this.baseURL}/checklists/group/${groupId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching group checklists:", error);
      return this.getMockGroupChecklists(groupId);
    }
  }

  async createGroupChecklist(groupId, checklistData) {
    try {
      const response = await fetch(
        `${this.baseURL}/checklists/group/${groupId}`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(checklistData),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error creating group checklist:", error);
      return this.mockCreateGroupChecklist(groupId, checklistData);
    }
  }

  // Task Management
  async updateTask(taskId, updates) {
    try {
      const response = await fetch(
        `${this.baseURL}/checklists/tasks/${taskId}`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updates),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error updating task:", error);
      return this.mockUpdateTask(taskId, updates);
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await fetch(
        `${this.baseURL}/checklists/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error deleting task:", error);
      return this.mockDeleteTask(taskId); // Add this line
    }
  }

  async addTask(checklistId, taskData) {
    try {
      const response = await fetch(
        `${this.baseURL}/checklists/${checklistId}/tasks`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(taskData),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error adding task:", error);
      return this.mockAddTask(checklistId, taskData);
    }
  }

  // Mock implementations for development
  getMockPersonalChecklists() {
    const saved = localStorage.getItem("personalChecklists");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "personal-1",
            title: "CS 101 Study Plan",
            description: "Personal study goals for data structures",
            type: "personal",
            createdAt: new Date().toISOString(),
            tasks: [
              {
                id: "task-1",
                title: "Review linked lists",
                completed: true,
                dueDate: "2024-01-20",
              },
              {
                id: "task-2",
                title: "Practice binary tree problems",
                completed: false,
                dueDate: "2024-01-22",
              },
              {
                id: "task-3",
                title: "Complete assignment 3",
                completed: false,
                dueDate: "2024-01-25",
              },
            ],
          },
        ];
  }

  getMockGroupChecklists(groupId) {
    const saved = localStorage.getItem(`groupChecklists-${groupId}`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "group-1",
            title: "Midterm Preparation",
            description: "Group study plan for upcoming midterm",
            type: "group",
            groupId,
            createdBy: "Demo User",
            createdAt: new Date().toISOString(),
            tasks: [
              {
                id: "gtask-1",
                title: "Create study schedule",
                completed: true,
                assignedTo: "Alice",
                dueDate: "2024-01-21",
                completedBy: "Alice",
              },
              {
                id: "gtask-2",
                title: "Gather practice problems",
                completed: false,
                assignedTo: "Bob",
                dueDate: "2024-01-23",
              },
              {
                id: "gtask-3",
                title: "Book study room",
                completed: false,
                assignedTo: "Carol",
                dueDate: "2024-01-24",
              },
            ],
          },
        ];
  }

  // Update the mock data to include due dates and priorities
  // Update the mockCreatePersonalChecklist function
  mockCreatePersonalChecklist(checklistData) {
    const newChecklist = {
      id: `personal-${Date.now()}`,
      ...checklistData,
      type: "personal",
      createdAt: new Date().toISOString(),
      tasks: [],
    };

    const checklists = this.getMockPersonalChecklists();
    checklists.push(newChecklist);
    localStorage.setItem("personalChecklists", JSON.stringify(checklists));
    return { success: true, data: newChecklist };
  }

  // Also update mockCreateGroupChecklist
  mockCreateGroupChecklist(groupId, checklistData) {
    const newChecklist = {
      id: `group-${Date.now()}`,
      ...checklistData,
      type: "group",
      groupId,
      createdBy: "Demo User",
      createdAt: new Date().toISOString(),
      tasks: [],
    };

    const checklists = this.getMockGroupChecklists(groupId);
    checklists.push(newChecklist);
    localStorage.setItem(
      `groupChecklists-${groupId}`,
      JSON.stringify(checklists)
    );
    return { success: true, data: newChecklist };
  }

  mockAddTask(checklistId, taskData) {
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Update personal checklists
    const personalChecklists = this.getMockPersonalChecklists();
    const personalIndex = personalChecklists.findIndex(
      (c) => c.id === checklistId
    );

    if (personalIndex !== -1) {
      personalChecklists[personalIndex].tasks.push(newTask);
      localStorage.setItem(
        "personalChecklists",
        JSON.stringify(personalChecklists)
      );
      return { success: true, data: newTask };
    }

    // If not found in personal, try group checklists
    // You'll need to determine the groupId - for now, try all possible group checklists
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("groupChecklists-")
    );
    for (const key of keys) {
      const groupChecklists = JSON.parse(localStorage.getItem(key));
      const groupIndex = groupChecklists.findIndex((c) => c.id === checklistId);

      if (groupIndex !== -1) {
        groupChecklists[groupIndex].tasks.push(newTask);
        localStorage.setItem(key, JSON.stringify(groupChecklists));
        return { success: true, data: newTask };
      }
    }

    return { success: true, data: newTask };
  }

  mockUpdateTask(taskId, updates) {
    // Update personal checklists
    const personalChecklists = this.getMockPersonalChecklists();
    let found = false;

    for (let i = 0; i < personalChecklists.length; i++) {
      const taskIndex = personalChecklists[i].tasks.findIndex(
        (t) => t.id === taskId
      );
      if (taskIndex !== -1) {
        personalChecklists[i].tasks[taskIndex] = {
          ...personalChecklists[i].tasks[taskIndex],
          ...updates,
        };
        localStorage.setItem(
          "personalChecklists",
          JSON.stringify(personalChecklists)
        );
        found = true;
        break;
      }
    }

    if (!found) {
      // Try group checklists
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("groupChecklists-")
      );
      for (const key of keys) {
        const groupChecklists = JSON.parse(localStorage.getItem(key));
        for (let i = 0; i < groupChecklists.length; i++) {
          const taskIndex = groupChecklists[i].tasks.findIndex(
            (t) => t.id === taskId
          );
          if (taskIndex !== -1) {
            groupChecklists[i].tasks[taskIndex] = {
              ...groupChecklists[i].tasks[taskIndex],
              ...updates,
            };
            localStorage.setItem(key, JSON.stringify(groupChecklists));
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    return { success: true, data: { id: taskId, ...updates } };
  }

  mockDeleteTask(taskId) {
    // Delete from personal checklists
    const personalChecklists = this.getMockPersonalChecklists();
    let found = false;

    for (let i = 0; i < personalChecklists.length; i++) {
      const taskIndex = personalChecklists[i].tasks.findIndex(
        (t) => t.id === taskId
      );
      if (taskIndex !== -1) {
        personalChecklists[i].tasks.splice(taskIndex, 1);
        localStorage.setItem(
          "personalChecklists",
          JSON.stringify(personalChecklists)
        );
        found = true;
        break;
      }
    }

    if (!found) {
      // Try group checklists
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("groupChecklists-")
      );
      for (const key of keys) {
        const groupChecklists = JSON.parse(localStorage.getItem(key));
        for (let i = 0; i < groupChecklists.length; i++) {
          const taskIndex = groupChecklists[i].tasks.findIndex(
            (t) => t.id === taskId
          );
          if (taskIndex !== -1) {
            groupChecklists[i].tasks.splice(taskIndex, 1);
            localStorage.setItem(key, JSON.stringify(groupChecklists));
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    return { success: true };
  }
}

export default new ChecklistService();
