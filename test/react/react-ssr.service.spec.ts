import { ReactSSRService } from '../../src/react/ssr/react-ssr.service';
import { ExampleServerComponent } from '../../src/react/ssr/components/ExampleServerComponent';

describe('ReactSSRService', () => {
  let service: ReactSSRService;

  beforeEach(() => {
    service = new ReactSSRService();
  });

  describe('render', () => {
    it('should render a React component to string', () => {
      const html = service.render(ExampleServerComponent, {
        title: 'Test Title',
        message: 'Test Message',
      });

      expect(html).toBeDefined();
      expect(typeof html).toBe('string');
    });

    it('should include GOV.UK CSS classes in rendered output', () => {
      const html = service.render(ExampleServerComponent, {
        title: 'Success',
        message: 'Operation completed',
      });

      expect(html).toContain('govuk-panel');
      expect(html).toContain('govuk-panel__title');
      expect(html).toContain('govuk-panel__body');
    });

    it('should include component props in rendered output', () => {
      const html = service.render(ExampleServerComponent, {
        title: 'Custom Title',
        message: 'Custom Message',
      });

      expect(html).toContain('Custom Title');
      expect(html).toContain('Custom Message');
    });
  });
});
