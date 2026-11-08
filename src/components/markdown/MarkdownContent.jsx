import { Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

// ----------------------------------------------------------------------

const markdownSx = {
  '& p': {
    margin: '6px 0',
    lineHeight: 1.6,
  },
  '& strong': {
    fontWeight: 700,
  },
  '& em': {
    fontStyle: 'italic',
  },
  '& ul': {
    paddingLeft: 6,
    margin: '6px 0',
    listStyleType: 'disc',
  },
  '& ol': {
    paddingLeft: 6,
    margin: '6px 0',
    listStyleType: 'decimal',
  },
  '& li': {
    display: 'list-item',
  },
  '& hr': {
    border: 'none',
    borderTop: '1px solid',
    borderColor: 'divider',
    my: 1.5,
  },
};

export function MarkdownContent({ children, sx, enableGfm = false }) {
  const text = String(children ?? '')
    .replace(/\u00A0/g, ' ')
    .trim();

  if (!text) {
    return null;
  }

  const remarkPlugins = enableGfm ? [remarkGfm, remarkBreaks] : [remarkBreaks];

  return (
    <Box sx={{ ...markdownSx, ...sx }}>
      <ReactMarkdown remarkPlugins={remarkPlugins}>{text}</ReactMarkdown>
    </Box>
  );
}
