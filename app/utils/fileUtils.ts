// Utilidades para procesar documentos antes de enviarlos a la API

export async function processDocument(file: File): Promise<{ name: string; content: string; type: string }> {
  const type = file.type
  let content = ''

  try {
    if (type === 'text/plain' || type === 'text/csv') {
      // Archivos de texto plano
      content = await file.text()
    } else if (type === 'application/pdf') {
      // Para PDFs necesitaremos una librería, por ahora mensaje informativo
      content = `[Archivo PDF: ${file.name}]\n\nNota: El contenido del PDF será procesado por Claude directamente.`
    } else if (type.includes('word') || type.includes('document')) {
      // Para Word necesitaremos una librería, por ahora mensaje informativo
      content = `[Documento Word: ${file.name}]\n\nNota: El contenido del documento será procesado por Claude directamente.`
    } else if (type.includes('sheet') || type.includes('excel')) {
      // Para Excel necesitaremos una librería, por ahora mensaje informativo
      content = `[Hoja de cálculo: ${file.name}]\n\nNota: El contenido de la hoja de cálculo será procesado por Claude directamente.`
    }

    return {
      name: file.name,
      content: content,
      type: type
    }
  } catch (error) {
    console.error('Error procesando documento:', error)
    return {
      name: file.name,
      content: `Error al leer el archivo: ${file.name}`,
      type: type
    }
  }
}

export async function processImage(file: File): Promise<{ data: string; type: string; name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      resolve({
        data: reader.result as string,
        type: file.type,
        name: file.name
      })
    }
    
    reader.onerror = () => {
      reject(new Error('Error al leer la imagen'))
    }
    
    reader.readAsDataURL(file)
  })
}
