import React, { useState } from 'react'

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

const TodoPlugin: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [inputText, setInputText] = useState('')

  const addTodo = () => {
    if (inputText.trim()) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: inputText.trim(),
        completed: false
      }
      setTodos([...todos, newTodo])
      setInputText('')
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const removeTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const listItems = todos.map(todo => ({
    id: todo.id,
    content: `${todo.completed ? '✅' : '⏳'} ${todo.text}`,
    selected: todo.completed
  }))

  return (
    <>
        <plugin-input
          value={inputText}
          placeholder="Add a new todo..."
          onChange={setInputText}
          onSubmit={addTodo}
        />
        <plugin-button
          label="Add Todo"
          variant="primary"
          onClick={addTodo}
          disabled={!inputText.trim()}
        />
        <plugin-listview
          items={listItems}
          onItemSelect={toggleTodo}
          onItemRemove={removeTodo}
        />
    </>
  )
}

export default TodoPlugin