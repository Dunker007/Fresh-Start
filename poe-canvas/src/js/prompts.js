// prompts.js - AI Prompt Templates
// Ported from legacy config/prompts/

export const PROMPT_TEMPLATES = [
    {
        id: 'seo-blog-post',
        name: 'SEO Blog Post',
        description: 'Create an SEO-optimized blog post',
        template: `Write a comprehensive, SEO-optimized blog post about: {{topic}}

Target Keywords: {{keywords}}
Word Count: {{wordCount}}
Tone: {{tone}}

Requirements:
- Engaging introduction with hook
- Well-structured with H2/H3 headings
- Include statistics or examples
- Natural keyword integration
- Actionable conclusion
- Use HTML formatting

Generate ONLY the blog post content.`
    },
    {
        id: 'product-review',
        name: 'Product Review',
        description: 'Detailed product review with pros/cons',
        template: `Write an honest, detailed review of: {{productName}}

Product Details:
{{productDetails}}

Target Audience: {{audience}}
Key Features to Highlight: {{features}}

Requirements:
- Honest pros and cons
- Personal experience tone
- Compare to alternatives
- Include use cases
- FTC disclosure statement
- Clear recommendation
- Use HTML formatting

Generate ONLY the review content.`
    },
    {
        id: 'code-refactor',
        name: 'Code Refactor',
        description: 'Refactor code for performance and readability',
        template: `Refactor the following code:

{{code}}

Goals:
- Improve performance
- Enhance readability
- Fix potential bugs
- Add comments where necessary

Return the refactored code in a markdown code block.`
    },
    {
        id: 'bug-fix',
        name: 'Bug Fix Analysis',
        description: 'Analyze and fix a bug',
        template: `Analyze this bug report and code:

Bug Description:
{{bugDescription}}

Code:
{{code}}

1. Explain the root cause.
2. Provide a fixed version of the code.
3. Suggest a test case to prevent regression.`
    }
];

export function getTemplateById(id) {
    return PROMPT_TEMPLATES.find(t => t.id === id);
}

export function fillTemplate(templateId, variables) {
    const template = getTemplateById(templateId);
    if (!template) return '';

    let content = template.template;
    for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return content;
}
