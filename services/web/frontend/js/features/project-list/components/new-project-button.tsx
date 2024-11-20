import { type JSXElementConstructor, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import getMeta from '../../../utils/meta'
import NewProjectButtonModal, {
  NewProjectButtonModalVariant,
} from './new-project-button/new-project-button-modal'
import AddAffiliation, { useAddAffiliation } from './add-affiliation'
import { Nullable } from '../../../../../types/utils'
import { sendMB } from '../../../infrastructure/event-tracking'
import importOverleafModules from '../../../../macros/import-overleaf-module.macro'
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from '@/features/ui/components/bootstrap-5/dropdown-menu'

type SendTrackingEvent = {
  dropdownMenu: string
  dropdownOpen: boolean
  institutionTemplateName?: string
}

type Segmentation = SendTrackingEvent & {
  'welcome-page-redesign': 'default'
}

type ModalMenuClickOptions = {
  modalVariant: NewProjectButtonModalVariant
  dropdownMenuEvent: string
}

type NewProjectButtonProps = {
  id: string
  buttonText?: string
  className?: string
  trackingKey?: string
  showAddAffiliationWidget?: boolean
}

function NewProjectButton({
  id,
  buttonText,
  className,
  trackingKey,
  showAddAffiliationWidget,
}: NewProjectButtonProps) {
  const { t } = useTranslation()
  const { templateLinks } = getMeta('ol-ExposedSettings')
  const [modal, setModal] =
    useState<Nullable<NewProjectButtonModalVariant>>(null)
  const portalTemplates = getMeta('ol-portalTemplates') || []
  const { show: enableAddAffiliationWidget } = useAddAffiliation()

  const sendTrackingEvent = useCallback(
    ({
      dropdownMenu,
      dropdownOpen,
      institutionTemplateName,
    }: SendTrackingEvent) => {
      if (trackingKey) {
        let segmentation: Segmentation = {
          'welcome-page-redesign': 'default',
          dropdownMenu,
          dropdownOpen,
        }

        if (institutionTemplateName) {
          segmentation = {
            ...segmentation,
            institutionTemplateName,
          }
        }

        sendMB(trackingKey, segmentation)
      }
    },
    [trackingKey]
  )

  const handleMainButtonClick = useCallback(
    (dropdownOpen: boolean) => {
      sendTrackingEvent({
        dropdownMenu: 'main-button',
        dropdownOpen,
      })
    },
    [sendTrackingEvent]
  )

  const handleModalMenuClick = useCallback(
    (
      e: React.MouseEvent,
      { modalVariant, dropdownMenuEvent }: ModalMenuClickOptions
    ) => {
      // avoid invoking the "onClick" callback on the main dropdown button
      e.stopPropagation()

      sendTrackingEvent({
        dropdownMenu: dropdownMenuEvent,
        dropdownOpen: true,
      })

      setModal(modalVariant)
    },
    [sendTrackingEvent]
  )

  const handlePortalTemplateClick = useCallback(
    (e: React.MouseEvent, institutionTemplateName: string) => {
      // avoid invoking the "onClick" callback on the main dropdown button
      e.stopPropagation()

      sendTrackingEvent({
        dropdownMenu: 'institution-template',
        dropdownOpen: true,
        institutionTemplateName,
      })
    },
    [sendTrackingEvent]
  )

  const handleStaticTemplateClick = useCallback(
    (e: React.MouseEvent, templateTrackingKey: string) => {
      // avoid invoking the "onClick" callback on the main dropdown button
      e.stopPropagation()

      sendTrackingEvent({
        dropdownMenu: templateTrackingKey,
        dropdownOpen: true,
      })
    },
    [sendTrackingEvent]
  )

  const [importProjectFromGithubMenu] = importOverleafModules(
    'importProjectFromGithubMenu'
  )

  const ImportProjectFromGithubMenu: JSXElementConstructor<{
    onClick: (e: React.MouseEvent) => void
  }> = importProjectFromGithubMenu?.import.default

  return (
    <>
      <Dropdown className={className} onSelect={handleMainButtonClick}>
        <DropdownToggle
          id={id}
          className="new-project-button"
          variant="primary"
        >
          {buttonText || t('new_project')}
        </DropdownToggle>
        <DropdownMenu>
          <li role="none">
            <DropdownItem
              onClick={e =>
                handleModalMenuClick(e, {
                  modalVariant: 'blank_project',
                  dropdownMenuEvent: 'blank-project',
                })
              }
            >
              {t('blank_project')}
            </DropdownItem>
          </li>
          <li role="none">
            <DropdownItem
              onClick={e =>
                handleModalMenuClick(e, {
                  modalVariant: 'example_project',
                  dropdownMenuEvent: 'example-project',
                })
              }
            >
              {t('example_project')}
            </DropdownItem>
          </li>
          <li role="none">
            <DropdownItem
              onClick={e =>
                handleModalMenuClick(e, {
                  modalVariant: 'upload_project',
                  dropdownMenuEvent: 'upload-project',
                })
              }
            >
              {t('upload_project')}
            </DropdownItem>
          </li>
          <li role="none">
            {ImportProjectFromGithubMenu && (
              <ImportProjectFromGithubMenu
                onClick={e =>
                  handleModalMenuClick(e, {
                    modalVariant: 'import_from_github',
                    dropdownMenuEvent: 'import-from-github',
                  })
                }
              />
            )}
          </li>
          {portalTemplates.length > 0 ? (
            <>
              <DropdownDivider />
              <DropdownHeader aria-hidden="true">
                {`${t('institution')} ${t('templates')}`}
              </DropdownHeader>
              {portalTemplates.map((portalTemplate, index) => (
                <li role="none" key={`portal-template-${index}`}>
                  <DropdownItem
                    key={`portal-template-${index}`}
                    href={`${portalTemplate.url}#templates`}
                    onClick={e =>
                      handlePortalTemplateClick(e, portalTemplate.name)
                    }
                    aria-label={`${portalTemplate.name} ${t('template')}`}
                  >
                    {portalTemplate.name}
                  </DropdownItem>
                </li>
              ))}
            </>
          ) : null}

          {templateLinks && templateLinks.length > 0 && (
            <>
              <DropdownDivider />
              <DropdownHeader aria-hidden="true">
                {t('templates')}
              </DropdownHeader>
            </>
          )}
          {templateLinks?.map((templateLink, index) => (
            <li role="none" key={`new-project-button-template-${index}`}>
              <DropdownItem
                href={templateLink.url}
                onClick={e =>
                  handleStaticTemplateClick(e, templateLink.trackingKey)
                }
                aria-label={`${templateLink.name} ${t('template')}`}
              >
                {templateLink.name === 'view_all'
                  ? t('view_all')
                  : templateLink.name}
              </DropdownItem>
            </li>
          ))}
          {showAddAffiliationWidget && enableAddAffiliationWidget ? (
            <>
              <DropdownDivider />
              <li className="add-affiliation-mobile-wrapper">
                <AddAffiliation className="is-mobile" />
              </li>
            </>
          ) : null}
        </DropdownMenu>
      </Dropdown>
      <NewProjectButtonModal modal={modal} onHide={() => setModal(null)} />
    </>
  )
}

export default NewProjectButton
