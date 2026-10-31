!ifndef BUILD_UNINSTALLER

!include nsDialogs.nsh
!include LogicLib.nsh

!ifdef APP_FILENAME
  !undef APP_FILENAME
!endif
!define APP_FILENAME "Billion Due"

!macro preInit
  SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Billion Due"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Billion Due"

  SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Billion Due"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Billion Due"
!macroend

!macro customInstallMode
  StrCpy $isForceMachineInstall "1"
!macroend

!macro customInit
  StrCpy $INSTDIR "C:\Billion Due"
!macroend

Var SecDialog
Var SecLabelEmail
Var SecTextEmail
Var SecLabelPass
Var SecTextPass
Var SecBtnOtp
Var SecLabelOtp
Var SecTextOtp
Var SecLabelKey
Var SecTextKey
Var SecLabelHw
Var SecLabelHwVal
Var SecGuestCheckbox

Var SecValEmail
Var SecValPass
Var SecValOtp
Var SecValKey

Function OnRequestOtpClick
  Pop $0
  ${NSD_GetText} $SecTextEmail $SecValEmail
  ${NSD_GetText} $SecTextPass $SecValPass
  
  ${If} $SecValEmail == ""
    MessageBox MB_ICONEXCLAMATION "Please enter Super Admin Email."
    Return
  ${EndIf}
  ${If} $SecValPass == ""
    MessageBox MB_ICONEXCLAMATION "Please enter Super Admin Password."
    Return
  ${EndIf}

  InitPluginsDir
  File /oname=$PLUGINSDIR\request-otp.ps1 "${__FILEDIR__}\request-otp.ps1"

  nsExec::ExecToStack 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\request-otp.ps1" "$SecValEmail" "$SecValPass"'
  Pop $0
  Pop $1

  StrCpy $2 $1 5 0
  StrCpy $3 $1 4 0
  ${If} $2 == "SENT:"
    MessageBox MB_ICONINFORMATION "Security Verification Code has been dispatched directly to your Gmail inbox ($SecValEmail)!$\r$\n$\r$\nPlease check your Gmail and enter the 6-digit OTP code below."
  ${ElseIf} $3 == "DEV:"
    MessageBox MB_ICONINFORMATION "Security Code Generated!$\r$\n(To receive directly in your Gmail, configure Gmail App Password in server/.env.local)$\r$\n$\r$\nServer test OTP: $1"
  ${ElseIf} $3 == "OK:"
    MessageBox MB_ICONINFORMATION "Verification code has been dispatched to your email! Please enter the 6-digit OTP code below."
  ${Else}
    MessageBox MB_ICONSTOP "Failed to request OTP:$\r$\n$1$\r$\nPlease verify your Super Admin credentials and ensure server/internet is connected."
  ${EndIf}
FunctionEnd

Function LicenseSecurityPage
  nsDialogs::Create 1018
  Pop $SecDialog

  ${If} $SecDialog == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100u 10u "Super Admin Gmail / Email:"
  Pop $SecLabelEmail

  ${NSD_CreateText} 105u 0 185u 12u ""
  Pop $SecTextEmail

  ${NSD_CreateLabel} 0 18u 100u 10u "Super Admin Password:"
  Pop $SecLabelPass

  ${NSD_CreatePassword} 105u 18u 120u 12u ""
  Pop $SecTextPass

  ${NSD_CreateButton} 230u 17u 60u 14u "Send OTP"
  Pop $SecBtnOtp
  ${NSD_OnClick} $SecBtnOtp OnRequestOtpClick

  ${NSD_CreateLabel} 0 36u 100u 10u "6-Digit Email OTP:"
  Pop $SecLabelOtp

  ${NSD_CreateText} 105u 36u 65u 12u ""
  Pop $SecTextOtp

  ${NSD_CreateLabel} 0 54u 100u 10u "10-Digit Install Key:"
  Pop $SecLabelKey

  ${NSD_CreateText} 105u 54u 100u 12u ""
  Pop $SecTextKey

  ${NSD_CreateLabel} 0 74u 290u 22u "Hardware Binding: This computer's Motherboard/BIOS Serial Number will be automatically registered to your commercial license on the central database."
  Pop $SecLabelHw

  ${NSD_CreateLabel} 0 100u 290u 18u "Active Internet Connection is strictly mandatory during installation."
  Pop $SecLabelHwVal

  ${NSD_CreateCheckbox} 0 122u 290u 18u "Install for 72-hour Guest Access (one default template; no renewal)"
  Pop $SecGuestCheckbox

  nsDialogs::Show
FunctionEnd

Function LicenseSecurityPageLeave
  ${NSD_GetState} $SecGuestCheckbox $0
  ${If} $0 == ${BST_CHECKED}
    MessageBox MB_ICONINFORMATION "Guest installation selected.$\r$\n$\r$\nThe app will create a local 72-hour guest workspace on first launch. Guest access cannot be renewed and does not register a commercial device."
    Return
  ${EndIf}

  ${NSD_GetText} $SecTextEmail $SecValEmail
  ${NSD_GetText} $SecTextPass $SecValPass
  ${NSD_GetText} $SecTextOtp $SecValOtp
  ${NSD_GetText} $SecTextKey $SecValKey

  ${If} $SecValEmail == ""
    MessageBox MB_ICONEXCLAMATION "Please enter Super Admin Email."
    Abort
  ${EndIf}
  ${If} $SecValPass == ""
    MessageBox MB_ICONEXCLAMATION "Please enter Super Admin Password."
    Abort
  ${EndIf}
  ${If} $SecValOtp == ""
    MessageBox MB_ICONEXCLAMATION "Please enter the 6-digit OTP code."
    Abort
  ${EndIf}
  ${If} $SecValKey == ""
    MessageBox MB_ICONEXCLAMATION "Please enter the 10-character Installation Key (Format: XXX-XXX-XXXX)."
    Abort
  ${EndIf}

  InitPluginsDir
  File /oname=$PLUGINSDIR\verify-license.ps1 "${__FILEDIR__}\verify-license.ps1"

  nsExec::ExecToStack 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\verify-license.ps1" "$SecValEmail" "$SecValPass" "$SecValOtp" "$SecValKey"'
  Pop $0
  Pop $1

  StrCpy $2 $1 12 0
  ${If} $2 == "OK_VERIFIED:"
    MessageBox MB_ICONINFORMATION "License & Super Admin credentials verified!$\r$\nDevice Hardware Serial has been registered on the central server.$\r$\nSetup will now proceed to install the files."
  ${Else}
    MessageBox MB_ICONSTOP "Verification failed:$\r$\n$1$\r$\nInstallation cannot proceed without valid credentials, OTP, and Installation Key."
    Abort
  ${EndIf}
FunctionEnd

!macro customPageAfterChangeDir
  Page custom LicenseSecurityPage LicenseSecurityPageLeave
!macroend

!macro customInstall
  InitPluginsDir
  ${If} ${FileExists} "${BUILD_RESOURCES_DIR}\cert.cer"
    File /oname=$PLUGINSDIR\cert.cer "${BUILD_RESOURCES_DIR}\cert.cer"
    nsExec::ExecToLog 'certutil.exe -addstore "TrustedPublisher" "$PLUGINSDIR\cert.cer"'
    nsExec::ExecToLog 'certutil.exe -addstore "Root" "$PLUGINSDIR\cert.cer"'
  ${EndIf}
!macroend

!endif
