; Conserva el appId de las versiones anteriores para actualizar la misma aplicación.
; customInit se ejecuta después de recuperar la ubicación antigua del registro.
!macro customInit
  ${if} $installMode == "all"
    StrCpy $INSTDIR "$PROGRAMFILES64\Gestor de Tracks"
  ${else}
    StrCpy $INSTDIR "$LOCALAPPDATA\Programs\Gestor de Tracks"
  ${endif}
!macroend
