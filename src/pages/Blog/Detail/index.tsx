import React, { FC } from 'react'
import nl2br from 'react-nl2br'
import { RouteComponentProps } from 'react-router'
import { message, Modal } from 'antd'
import { Link } from 'react-router-dom'
import { H1 } from 'components/Typography/H1'
import { Loader } from 'components/Loader'
import { ErrorAlert } from 'components/ErrorAlert'
import { Button } from 'components/Button'
import { useMe } from 'modules/auth/hooks/useMe'
import { useDeletePage } from 'modules/blog/hooks/useDeletePage'
import { usePageDetail } from 'modules/blog/hooks/usePageDetail'
import { RelevantPagesList } from 'modules/blog/components/RelevantPagesList'
import { DetailContainer, ControlButtonsContainer } from './styled'

const { confirm: antConfirm } = Modal

export const DetailPage: FC<
  RouteComponentProps<{ pageId: string }>
> = props => {
  const pageId = Number(props.match.params.pageId)
  const { data, loading, error: loadingError } = usePageDetail({ pageId })
  const { data: userData, loading: isLoadingUser } = useMe()
  const [deletePage, { loading: isDeleting }] = useDeletePage()

  if (loadingError) {
    return <ErrorAlert>{loadingError.message}</ErrorAlert>
  }

  if (loading || isLoadingUser) {
    return <Loader />
  }

  const morePages = data.pageDetail.user.pages.filter(
    page => page.id !== String(pageId)
  )

  const handleDeletePage = () => {
    antConfirm({
      title: 'Are you sure delete this page?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deletePage({ variables: { id: Number(data.pageDetail.id) } })
          props.history.push('/')
        } catch (error) {
          message.error(error.message)
        }
      },
    })
  }

  return (
    <>
      <DetailContainer>
        <H1>{data.pageDetail.title}</H1>
        <p>{nl2br(data.pageDetail.text)}</p>
      </DetailContainer>

      {userData && userData.me && userData.me.id === data.pageDetail.user.id && (
        <ControlButtonsContainer>
          <Link to={`/blog/${data.pageDetail.id}/edit`}>
            <Button type="primary">edit page</Button>
          </Link>
          <Button
            onClick={handleDeletePage}
            disabled={isDeleting}
            type="danger"
          >
            {isDeleting ? 'deleting page...' : 'delete page'}
          </Button>
        </ControlButtonsContainer>
      )}

      {Boolean(morePages.length) && (
        <RelevantPagesList user={data.pageDetail.user} pages={morePages} />
      )}
    </>
  )
}