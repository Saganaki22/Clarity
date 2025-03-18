"use client"

import { useState, useEffect } from "react"
import {
  LayoutGrid,
  List,
  CalendarIcon,
  Columns,
  Filter,
  SortAsc,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  Edit,
  Copy,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ViewType = "table" | "board" | "list" | "calendar"
type Status = "Not Started" | "In Progress" | "Completed" | "On Hold"
type Priority = "Low" | "Medium" | "High"

interface Task {
  id: string
  title: string
  status: Status
  priority: Priority
  dueDate: string
  assignee: {
    name: string
    avatar?: string
    initials: string
  }
  tags: string[]
  description?: string
}

const statusColors: Record<Status, string> = {
  "Not Started": "bg-muted",
  "In Progress": "bg-blue-500",
  Completed: "bg-success",
  "On Hold": "bg-warning",
}

const priorityColors: Record<Priority, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-warning text-warning-foreground",
  High: "bg-destructive text-destructive-foreground",
}

// Function to save tasks to localStorage
const saveTasks = (tasks: Task[]) => {
  localStorage.setItem("clarity_tasks", JSON.stringify(tasks))
}

// Function to get tasks from localStorage
const getSavedTasks = (): Task[] => {
  const savedTasks = localStorage.getItem("clarity_tasks")
  if (savedTasks) {
    return JSON.parse(savedTasks)
  }

  // Default tasks if none are saved
  return [
    {
      id: "1",
      title: "Create project plan",
      status: "Completed",
      priority: "High",
      dueDate: "2023-03-15",
      assignee: {
        name: "Alex Johnson",
        initials: "AJ",
      },
      tags: ["Planning", "Documentation"],
      description: "Develop a comprehensive project plan including timeline, resources, and deliverables.",
    },
    {
      id: "2",
      title: "Design user interface mockups",
      status: "In Progress",
      priority: "Medium",
      dueDate: "2023-03-20",
      assignee: {
        name: "Sam Taylor",
        initials: "ST",
      },
      tags: ["Design", "UI/UX"],
      description: "Create wireframes and high-fidelity mockups for the main application screens.",
    },
    {
      id: "3",
      title: "Develop authentication system",
      status: "Not Started",
      priority: "High",
      dueDate: "2023-03-25",
      assignee: {
        name: "Jamie Smith",
        initials: "JS",
      },
      tags: ["Development", "Security"],
      description: "Implement secure user authentication including login, registration, and password recovery.",
    },
    {
      id: "4",
      title: "Write API documentation",
      status: "Not Started",
      priority: "Low",
      dueDate: "2023-04-01",
      assignee: {
        name: "Morgan Lee",
        initials: "ML",
      },
      tags: ["Documentation", "API"],
      description: "Document all API endpoints, request/response formats, and authentication requirements.",
    },
    {
      id: "5",
      title: "Conduct user testing",
      status: "On Hold",
      priority: "Medium",
      dueDate: "2023-04-05",
      assignee: {
        name: "Taylor Wong",
        initials: "TW",
      },
      tags: ["Testing", "User Research"],
      description:
        "Organize and conduct user testing sessions to gather feedback on the application interface and functionality.",
    },
  ]
}

export function DatabaseView() {
  const [viewType, setViewType] = useState<ViewType>("table")
  const [tasks, setTasks] = useState<Task[]>([])
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All")
  const [sortBy, setSortBy] = useState<"title" | "dueDate" | "priority" | "status">("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Load tasks from localStorage on component mount
  useEffect(() => {
    setTasks(getSavedTasks())
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasks(tasks)
    }
  }, [tasks])

  const addNewTask = (task: Omit<Task, "id">) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
    }
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
    setShowNewTaskModal(false)
  }

  const updateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
    setEditingTask(null)
  }

  const deleteTask = (taskId: string) => {
    // Use the browser's native confirm dialog instead of our custom AlertDialog
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      console.log("Deleting task:", taskId)

      // Create a new array without the deleted task
      const updatedTasks = tasks.filter((task) => task.id !== taskId)

      // Update state with the new array
      setTasks(updatedTasks)

      // Save to localStorage
      localStorage.setItem("clarity_tasks", JSON.stringify(updatedTasks))

      console.log("Task deleted successfully, remaining tasks:", updatedTasks.length)
    }
  }

  const duplicateTask = (taskId: string) => {
    const taskToDuplicate = tasks.find((task) => task.id === taskId)
    if (taskToDuplicate) {
      const duplicatedTask = {
        ...taskToDuplicate,
        id: Date.now().toString(),
        title: `${taskToDuplicate.title} (Copy)`,
      }
      const updatedTasks = [...tasks, duplicatedTask]
      setTasks(updatedTasks)
      saveTasks(updatedTasks)
    }
  }

  const filteredTasks = tasks.filter((task) => (filterStatus === "All" ? true : task.status === filterStatus))

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "dueDate") {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    } else if (sortBy === "priority") {
      const priorityOrder = { Low: 0, Medium: 1, High: 2 }
      return sortDirection === "asc"
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority]
    } else {
      // title or status
      return sortDirection === "asc" ? a[sortBy].localeCompare(b[sortBy]) : b[sortBy].localeCompare(a[sortBy])
    }
  })

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const handleSort = (field: "title" | "dueDate" | "priority" | "status") => {
    if (sortBy === field) {
      toggleSortDirection()
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  const updateTaskStatus = (taskId: string, status: Status) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  const changeViewType = (type: ViewType) => {
    setViewType(type)
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewType === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => changeViewType("table")}
          >
            <Columns className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button
            variant={viewType === "board" ? "default" : "ghost"}
            size="sm"
            onClick={() => changeViewType("board")}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Board
          </Button>
          <Button variant={viewType === "list" ? "default" : "ghost"} size="sm" onClick={() => changeViewType("list")}>
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewType === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => changeViewType("calendar")}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Calendar
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter {filterStatus !== "All" && `(${filterStatus})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus("All")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("Not Started")}>Not Started</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("In Progress")}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("On Hold")}>On Hold</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("Completed")}>Completed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-1" />
                Sort {sortBy !== "dueDate" && `(${sortBy})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSort("title")}>By Title</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("dueDate")}>By Due Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("priority")}>By Priority</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("status")}>By Status</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={() => setShowNewTaskModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
        </div>
      </div>

      {viewType === "table" && (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium text-sm">Task</th>
                <th className="text-left p-3 font-medium text-sm">Status</th>
                <th className="text-left p-3 font-medium text-sm">Priority</th>
                <th className="text-left p-3 font-medium text-sm">Due Date</th>
                <th className="text-left p-3 font-medium text-sm">Assignee</th>
                <th className="text-left p-3 font-medium text-sm">Tags</th>
                <th className="text-left p-3 font-medium text-sm w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task) => (
                <tr key={task.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">{task.title}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", statusColors[task.status])} />
                      {task.status}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className={cn(priorityColors[task.priority], "font-normal")}>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                      <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="font-normal text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTask(task)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateTask(task.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteTask(task.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewType === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(["Not Started", "In Progress", "On Hold", "Completed"] as Status[]).map((status) => (
            <div key={status} className="border rounded-md bg-muted/30">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", statusColors[status])} />
                  <h3 className="text-sm font-medium">{status}</h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {sortedTasks.filter((t) => t.status === status).length}
                </span>
              </div>
              <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {sortedTasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <div key={task.id} className="p-3 bg-background rounded-md border shadow-sm relative">
                      <div className="font-medium mb-2">{task.title}</div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={cn(priorityColors[task.priority], "font-normal")}>
                          {task.priority}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {task.tags.slice(0, 1).map((tag) => (
                            <Badge key={tag} variant="secondary" className="font-normal text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {task.tags.length > 1 && (
                            <Badge variant="secondary" className="font-normal text-xs">
                              +{task.tags.length - 1}
                            </Badge>
                          )}
                        </div>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                          <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                        </Avatar>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateTask(task.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteTask(task.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "Not Started")}>
                            <Circle className="h-3.5 w-3.5 mr-2" />
                            Not Started
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "In Progress")}>
                            <Circle className="h-3.5 w-3.5 mr-2 text-blue-500 fill-blue-500" />
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "On Hold")}>
                            <Circle className="h-3.5 w-3.5 mr-2 text-warning fill-warning" />
                            On Hold
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "Completed")}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-success" />
                            Completed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => {
                    setShowNewTaskModal(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add task
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewType === "list" && (
        <div className="space-y-2">
          {sortedTasks.map((task) => (
            <div key={task.id} className="border rounded-md p-3 hover:bg-muted/30 flex items-center">
              <div className="mr-3">
                {task.status === "Completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className={cn("font-medium", task.status === "Completed" && "line-through text-muted-foreground")}>
                  {task.title}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Badge variant="outline" className={cn(priorityColors[task.priority], "font-normal")}>
                    {task.priority}
                  </Badge>
                  <span>•</span>
                  <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="font-normal text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Avatar className="h-8 w-8 ml-2">
                <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                <AvatarFallback>{task.assignee.initials}</AvatarFallback>
              </Avatar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingTask(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateTask(task.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "Not Started")}>
                    Mark as Not Started
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "In Progress")}>
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "Completed")}>
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "On Hold")}>
                    Mark as On Hold
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground mt-2"
            onClick={() => setShowNewTaskModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add task
          </Button>
        </div>
      )}

      {viewType === "calendar" && (
        <div className="border rounded-md p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium">March 2023</h3>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const dayTasks = sortedTasks.filter((task) => {
                const taskDate = new Date(task.dueDate)
                return taskDate.getDate() === day && taskDate.getMonth() === 2 // March is month 2 (0-indexed)
              })

              return (
                <div
                  key={day}
                  className={cn(
                    "border rounded-md p-2 min-h-[100px] relative",
                    dayTasks.length > 0 && "bg-primary/5 border-primary/30",
                  )}
                >
                  <div className="text-sm font-medium mb-1">{day}</div>
                  {dayTasks.map((task) => (
                    <div key={task.id} className="bg-background border rounded-md p-1 text-xs shadow-sm mb-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-muted-foreground mt-1 flex items-center">
                        <div className={cn("w-1.5 h-1.5 rounded-full mr-1", statusColors[task.status])} />
                        {task.status}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      <Dialog
        open={showNewTaskModal || !!editingTask}
        onOpenChange={(open) => {
          if (!open) {
            setShowNewTaskModal(false)
            setEditingTask(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Make changes to your task here." : "Add a new task to your project."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const taskData = {
                title: formData.get("title") as string,
                status: formData.get("status") as Status,
                priority: formData.get("priority") as Priority,
                dueDate: formData.get("dueDate") as string,
                assignee: editingTask
                  ? editingTask.assignee
                  : {
                      name: "Current User",
                      initials: "CU",
                    },
                tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((tag) => tag.trim()) : [],
                description: formData.get("description") as string,
              }

              if (editingTask) {
                updateTask({ ...taskData, id: editingTask.id })
              } else {
                addNewTask(taskData)
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={editingTask?.title || ""} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingTask?.description || ""} rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingTask?.status || "Not Started"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue={editingTask?.priority || "Medium"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  defaultValue={editingTask?.dueDate || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={editingTask?.tags.join(", ") || ""}
                  placeholder="Design, Development, Research"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewTaskModal(false)
                  setEditingTask(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingTask ? "Save Changes" : "Create Task"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

