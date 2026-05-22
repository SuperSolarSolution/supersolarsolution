import json
import re

with open('generated_seo_blogs.json', 'r', encoding='utf-8') as f:
    generated_blogs = json.load(f)

# Convert the python list of dicts to a TypeScript array string
blogs_ts_str = ",\n".join(json.dumps(blog, indent=2) for blog in generated_blogs)

with open('src/data/blogPosts.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of the `blogPosts` array declaration.
# It typically looks like: export const blogPosts: BlogPost[] = [ ... ];
# We will inject the blogs_ts_str right before the closing `];` of the `blogPosts` array.

# Find the last `];` before the utility functions.
# We can use regex or just simple string manipulation.
marker = "export function getBlogPost"
if marker in content:
    parts = content.split(marker)
    top_part = parts[0]
    bottom_part = marker + parts[1]

    # In top_part, find the last `];`
    last_bracket_index = top_part.rfind('];')
    if last_bracket_index != -1:
        # Check if the array is empty or not
        # Let's insert a comma if the previous element didn't have one
        insert_text = ",\n" + blogs_ts_str + "\n"
        new_top_part = top_part[:last_bracket_index] + insert_text + top_part[last_bracket_index:]
        new_content = new_top_part + bottom_part

        with open('src/data/blogPosts.ts', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully patched src/data/blogPosts.ts")
    else:
        print("Could not find the end of blogPosts array.")
else:
    print("Could not find the marker for utility functions.")
