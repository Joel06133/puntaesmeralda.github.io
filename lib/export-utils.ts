// Función para exportar datos a Excel (CSV)
export function exportToCSV(data: any[], filename: string) {
  // Verificar si estamos en el navegador
  if (typeof window === "undefined") return

  // Obtener las cabeceras (nombres de las propiedades)
  const headers = Object.keys(data[0])

  // Crear el contenido CSV
  let csvContent = headers.join(",") + "\n"

  // Agregar las filas de datos
  csvContent += data
    .map((row) => {
      return headers
        .map((header) => {
          // Manejar valores que puedan contener comas o comillas
          let cell = row[header] === null || row[header] === undefined ? "" : row[header].toString()

          // Si el valor contiene comas, comillas o saltos de línea, encerrarlo en comillas
          if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
            cell = '"' + cell.replace(/"/g, '""') + '"'
          }

          return cell
        })
        .join(",")
    })
    .join("\n")

  // Crear un blob con el contenido CSV
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  // Crear un enlace para descargar el archivo
  const link = document.createElement("a")

  // Crear una URL para el blob
  const url = URL.createObjectURL(blob)

  // Configurar el enlace
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  // Agregar el enlace al documento
  document.body.appendChild(link)

  // Hacer clic en el enlace para iniciar la descarga
  link.click()

  // Limpiar
  document.body.removeChild(link)
}

// Función para importar datos desde CSV
export function importFromCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string
        const lines = csvData.split("\n")

        // Obtener las cabeceras
        const headers = lines[0].split(",").map(
          (header) => header.replace(/^"(.*)"$/, "$1"), // Eliminar comillas si existen
        )

        // Procesar las filas de datos
        const result = []
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue // Saltar líneas vacías

          const values = parseCSVLine(lines[i])

          if (values.length === headers.length) {
            const obj: Record<string, any> = {}
            headers.forEach((header, index) => {
              obj[header] = values[index]
            })
            result.push(obj)
          }
        }

        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsText(file)
  })
}

// Función auxiliar para analizar líneas CSV correctamente (maneja valores entre comillas)
function parseCSVLine(line: string): string[] {
  const result = []
  let currentValue = ""
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (i + 1 < line.length && line[i + 1] === '"') {
        // Doble comilla dentro de un valor entre comillas
        currentValue += '"'
        i++ // Saltar la siguiente comilla
      } else {
        // Alternar el estado de insideQuotes
        insideQuotes = !insideQuotes
      }
    } else if (char === "," && !insideQuotes) {
      // Fin del valor actual
      result.push(currentValue)
      currentValue = ""
    } else {
      // Agregar el carácter al valor actual
      currentValue += char
    }
  }

  // Agregar el último valor
  result.push(currentValue)

  return result
}
