import React, { useContext, useEffect, useState, useCallback } from 'react'
import clsx from 'clsx'
import Button from './button'
import Settings from './settings'
import WrapSelect from './select'
import ZoomControls from './zoom'
import NavigationControls from './navigation'
import Slider from '@/components/slider'
import Localize from '@/localize'
import { ReaderContext } from '@/context'

import {
  mdiPin,
  mdiBookOpen,
  mdiFullscreen,
  mdiWeatherNight,
  mdiFullscreenExit,
  mdiBookOpenOutline,
  mdiWhiteBalanceSunny,
} from '@mdi/js'

const isFocused = () => {
  const elem = document.activeElement
  const contains = document.querySelector('div.villain').contains(elem)
  const elemType = elem.tagName.toLowerCase()
  const forbiddenElemTypes = ['input', 'textarea', 'button']
  return contains && forbiddenElemTypes.indexOf(elemType) === -1
}

const Toolbar = ({
  allowFullScreen,
  showControls,
  toggleFullscreen,
  updateZoom,
  renderError,
  localize,
}) => {
  const {
    state,
    toggleSetting,
    navigateForward,
    navigateBackward,
    navigateToPage,
    toggleTheme,
    togglePin,
  } = useContext(ReaderContext)

  const {
    theme,
    pages,
    bookMode,
    mangaMode,
    fullscreen,
    currentPage,
    currentZoom,
    totalPages,
    autoHideControls,
    allowGlobalShortcuts,
  } = state

  const [lang, setLang] = useState('en-US')

  useEffect(() => {
    // Note: Unsure about this, it probalby affect peformance
    Localize.setLanguage(lang)
  }, [lang])

  // Note:? We should provide an api to add, define, overwrite key shortcuts
  const handleShortcuts = useCallback(
    event => {
      // Check if it should restrict listening for key shortcuts on player focus
      if (!isFocused() && !allowGlobalShortcuts) {
        return
      }

      const navigateRight = mangaMode ? navigateBackward : navigateForward
      const navigateLeft = mangaMode ? navigateForward : navigateBackward

      switch (event.key) {
        // Toggle fullscreen of viewer.
        // Note: Current conflict with openseadragon key shortcuts.
        // Note: PreventDefault is used to remove flp shortcut.
        case 'f':
          event.preventDefault()
          toggleFullscreen()
          break

        // Navigation to next page (previous when in mangaMode)
        case 'ArrowRight':
          navigateRight()
          break

        // Navigation to previous page (next when in mangaMode)
        case 'ArrowLeft':
          navigateLeft()
          break
      }
    },
    [allowGlobalShortcuts, mangaMode, navigateBackward, navigateForward, toggleFullscreen]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleShortcuts)

    return () => {
      document.removeEventListener('keydown', handleShortcuts)
    }
  }, [handleShortcuts])

  const handleLanguageChange = ({ target }) => {
    setLang(target.value)
  }

  const fullScreenIcon = fullscreen ? mdiFullscreenExit : mdiFullscreen

  const progress = (pages.length / totalPages) * 100

  return (
    <div className={clsx('villain-toolbar', !showControls && 'villain-toolbar-hide')}>
      <NavigationControls currentPage={currentPage} totalPages={totalPages} />

      <div className={'villain-toolbar-group villain-toolbar-group-expand'}>
        <Slider
          max={totalPages}
          value={currentPage}
          bufferProgress={progress}
          onChange={navigateToPage}
          reversed={mangaMode}
        />
      </div>

      <div className={'villain-toolbar-group'} disabled={renderError}>
        <ZoomControls
          onUpdate={updateZoom}
          currentZoom={currentZoom}
          disabled={renderError}
        />
        <div className="divider" />

        <Settings />

        <Button
          typeClass={'icon'}
          icon={mdiPin}
          active={!autoHideControls}
          onClick={togglePin}
          disabled={renderError}
          tooltip={Localize['Pin controls']}
        />

        <Button
          typeClass={'icon'}
          icon={bookMode ? mdiBookOpen : mdiBookOpenOutline}
          onClick={() => toggleSetting('bookMode')}
          disabled={renderError}
          tooltip={bookMode ? Localize['Page view'] : Localize['Book view']}
        />

        {/*
        <Button
          typeClass={'icon'}
          icon={theme === 'Light' ? mdiWeatherNight : mdiWhiteBalanceSunny}
          onClick={toggleTheme}
          disabled={renderError}
          tooltip={theme === 'Light' ? Localize['Dark theme'] : Localize['Light theme']}
        />
        */}

        {allowFullScreen && (
          <Button
            typeClass={'icon'}
            icon={fullScreenIcon}
            onClick={toggleFullscreen}
            disabled={renderError}
            tooltip={
              fullscreen ? Localize['Exit fullscreen'] : Localize['Enter fullscreen']
            }
            tooltipPlacement={'top-end'}
          />
        )}

        {/*
            Move this component to menu!
          <WrapSelect
            inputId="langSelector"
            value={this.state.lang}
            options={Localize.getAvailableLanguages()}
            onChange={this.handleLanguageChange}
            icon={mdiWeb}
            label="Language toggle"
          />
         */}
      </div>
    </div>
  )
}

export default Toolbar
