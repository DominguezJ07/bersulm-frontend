import { useEffect, useState } from 'react'
import { appointmentsService } from '../services/appointments.service'

export function useAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    appointmentsService
      .getAppointments()
      .then((data) => {
        if (isMounted) {
          setAppointments(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { appointments, loading }
}
